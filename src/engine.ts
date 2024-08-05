import * as tf from '@tensorflow/tfjs'
import { TextAnalyzer } from './text-analyzer'
import {
  mlModelOptionsSchema, kanas, phonemes, romajis, envKeyVolumes,
  kanaDataArraySchema, speakerVoiceSchema, synthConfigSchema, f0SegSchema
} from './schemata'
import type {
  MlModelOptions, OptiDict, KanaData, PhonemeData, EnvKeyData,
  PhonemeEnum, EnvKeyEnum, SpeakerVoice, SynthConfig
} from './schemata'
import {
  isBrowser, canUseWebGPU, canUseWebGL, seq2seg,
  raw2wav, interpZeros, resample, sum, int, linspace, interp
} from './utils'
import { systemDict } from './system-dict'
import { laychieVoice } from './speakers/laychie'
import { layneyVoice } from './speakers/layney'
import { resolve } from 'pathe'
import { z } from 'zod'

export class PoinoTalkEngine {
  private initialized: boolean
  private textAnalyzer: TextAnalyzer

  private durationModel: tf.LayersModel | null
  private f0Model:       tf.LayersModel | null

  private slidingWinLen:   number | null
  private f0ModelBaseFreq: number | null
  private f0NormMax:       number | null

  constructor() {
    this.initialized = false
    this.textAnalyzer = new TextAnalyzer()

    this.durationModel = null
    this.f0Model       = null

    this.slidingWinLen   = null
    this.f0ModelBaseFreq = null
    this.f0NormMax       = null
  }

  init() {
    if (this.initialized === true) {
      throw new Error('already initialized')
    }

    this.loadSystemDict(systemDict)

    return (
      this.textAnalyzer.init()
      .then(() => {
        if (isBrowser) {
          if (canUseWebGPU) {
            return import('@tensorflow/tfjs-backend-webgpu')
          } else if (canUseWebGL) {
            return import('@tensorflow/tfjs-backend-webgl')
          } else {
            return Promise.reject('both WebGPU and WebGL are unavailable in this environment')
          }
        } else {
          return import('@tensorflow/tfjs-node')
        }
      })
      .then(() => {
        if (isBrowser) {
          if (canUseWebGPU) {
            return tf.setBackend('webgpu')
          } else {
            return tf.setBackend('webgl')
          }
        } else {
          return tf.setBackend('tensorflow')
        }
      })
      .then(() => tf.ready())
    )
  }

  loadOpenjlabelDict(files: { fileName: string, data: Uint8Array }[]) {
    return this.textAnalyzer.loadOpenjlabelDict(files)
  }

  private loadSystemDict(dict: OptiDict) {
    this.textAnalyzer.loadSystemDict(dict)
  }

  loadUserDict(dict: OptiDict) {
    this.textAnalyzer.loadUserDict(dict)
  }

  clearUserDict() {
    this.textAnalyzer.clearUserDict()
  }

  loadMlModels(
    modelJsonPaths: { [key in 'duration' | 'f0']: string },
    options: MlModelOptions
  ) {
    mlModelOptionsSchema.parse(options)

    this.slidingWinLen   = options.slidingWinLen
    this.f0ModelBaseFreq = options.f0ModelBaseFreq
    this.f0NormMax       = options.f0NormMax

    if (!isBrowser) {
      modelJsonPaths.duration = `file://${resolve(modelJsonPaths.duration)}`
      modelJsonPaths.f0       = `file://${resolve(modelJsonPaths.f0)}`
    }

    return (
      Promise.all([
        tf.loadLayersModel(modelJsonPaths.duration),
        tf.loadLayersModel(modelJsonPaths.f0)
      ])
      .then(([durationModel, f0Model]) => {
        this.durationModel = durationModel
        this.f0Model       = f0Model
      })
      .catch(console.error)
    )
  }

  analyzeText(text: string) {
    let analyzePromise: Promise<KanaData[]> = Promise.resolve([])

    tf.tidy(() => {
      analyzePromise = this._analyzeText(text)
    })

    return analyzePromise
  }

  synthesizeVoice(
    analyzedData: KanaData[],
    speakerVoice: SpeakerVoice,
    config: SynthConfig
  ) {
    let synthesizePromise: Promise<Float32Array> = Promise.resolve(new Float32Array())

    tf.tidy(() => {
      synthesizePromise = this._synthesizeVoice(
        analyzedData,
        speakerVoice,
        config
      )
    })

    return synthesizePromise
  }

  static getSpeakers() {
    return {
      laychie: laychieVoice,
      layney:  layneyVoice
    }
  }

  private _analyzeText(text: string) {
    let kanaDataArray = this.textAnalyzer.analyze(text)
    let phonemeDataArray = this.kanaDataToPhonemeData(kanaDataArray)

    const phonemeTensor = tf.tidy(() => {
      if (this.slidingWinLen === null) {
        throw new Error(
          `sliding win len is null, call "${this.analyzeText.name}" after calling "${this.loadMlModels.name}"`
        )
      }

      return this.genPhonemeTensor(phonemeDataArray, this.slidingWinLen)
    })

    const predicted = tf.tidy(() => {
      if (this.durationModel === null) {
        throw new Error(
          `duration model is null, call "${this.analyzeText.name}" after calling "${this.loadMlModels.name}"`
        )
      }

      const predicted = this.durationModel.apply(phonemeTensor, { training: false }) as tf.Tensor

      tf.keep(phonemeTensor)
      tf.keep(predicted)

      return predicted
    })

    return new Promise<KanaData[]>((resolve, reject) => {
      (predicted.data() as Promise<Float32Array>)
      .then((lengths) => {
        phonemeDataArray = phonemeDataArray.map(({phoneme, accent}, index) => ({
          phoneme: phoneme,
          accent:  accent,
          length:  lengths[index]
        }))
        kanaDataArray = this.phonemeDataToKanaData(phonemeDataArray)
        resolve(kanaDataArray)
      })
      .catch(reject)
      .finally(() => {
        phonemeTensor.dispose()
        predicted.dispose()
      })
    })
  }

  private _synthesizeVoice(
    analyzedData: KanaData[],
    speakerVoice: SpeakerVoice,
    config: SynthConfig
  ) {
    kanaDataArraySchema.parse(analyzedData)
    speakerVoiceSchema.parse(speakerVoice)
    synthConfigSchema.parse(config)

    const voice    = speakerVoice
    const fs       = speakerVoice.fs
    const channels = 1
    const dtype    = Float32Array

    const duration = sum(analyzedData.flatMap((data) => data.lengths))

    if (duration <= 0) {
      const raw = new Float32Array(0)
      const wav = raw2wav<Float32Array>(raw, fs, channels, dtype)
      return Promise.resolve(wav)
    }

    const phonemeDataArray = this.kanaDataToPhonemeData(analyzedData)

    const phonemeTensor = tf.tidy(() => {
      if (this.slidingWinLen === null) {
        throw new Error(
          `sliding win len is null, call "${this.synthesizeVoice.name}" after calling "${this.loadMlModels.name}"`
        )
      }

      return this.genPhonemeTensor(phonemeDataArray, this.slidingWinLen)
    })

    const accentTensor = tf.tidy(() => {
      if (this.slidingWinLen === null) {
        throw new Error(
          `sliding win len is null, call "${this.synthesizeVoice.name}" after calling "${this.loadMlModels.name}"`
        )
      }

      return this.genAccentTensor(phonemeDataArray, this.slidingWinLen)
    })

    const f0Predicted = tf.tidy(() => {
      if (this.f0Model === null) {
        throw new Error(
          `f0 model is null, call "${this.synthesizeVoice.name}" after calling "${this.loadMlModels.name}"`
        )
      }

      const predicted = this.f0Model.apply([phonemeTensor, accentTensor], { training: false }) as tf.Tensor

      tf.keep(phonemeTensor)
      tf.keep(accentTensor)
      tf.keep(predicted)

      return predicted
    })

    const f0EnvsPromise = (f0Predicted.array() as Promise<number[][]>)

    f0EnvsPromise
    .finally(() => {
      phonemeTensor.dispose()
      accentTensor.dispose()
      f0Predicted.dispose()
    })

    const promise = new Promise<Float32Array>((resolve, reject) => {
      const speed = config.speed
      const numAdjustmentSec = 0.1
      const waveLen = int(fs * ((duration / speed) + numAdjustmentSec))

      let wave = tf.zeros([waveLen])
      tf.keep(wave)

      f0EnvsPromise
      .then((f0Envs) => {
        if (this.f0NormMax === null) {
          throw new Error(
            `f0 norm max is null, call "${this.synthesizeVoice.name}" after calling "${this.loadMlModels.name}"`
          )
        }

        const f0NormMax = this.f0NormMax
        const pitch = config.pitch

        f0Envs = f0Envs.map((env) => interpZeros(env).map((value) => value * f0NormMax * pitch))

        if (this.f0ModelBaseFreq === null) {
          throw new Error(
            `f0 model base freq is null, call "${this.synthesizeVoice.name}" after calling "${this.loadMlModels.name}"`
          )
        }

        const f0Adapter = voice.baseFreq / this.f0ModelBaseFreq
        let envsIndex = 0

        const dataArray: {
          envKeyData: EnvKeyData[]
          f0Seg: z.infer<typeof f0SegSchema>
        }[] = analyzedData
        .map(({kana, accent, lengths}, index) => {
          const envLenData = voice.kanas[kana]
          if (envLenData === undefined) return null

          const lengthsLen = lengths.length
          const phonemeDataLen = this.kanaDataToPhonemeData([{ kana, accent, lengths }]).length
          if (lengthsLen !== phonemeDataLen) {
            throw new Error(`number of elements in "lengths" of number ${index} in "data" is invalid`)
          }

          const begin = envsIndex
          const end   = begin + lengthsLen

          envsIndex = end

          const f0EnvsSliced  = f0Envs.slice(begin, end)

          const f0Seg =
            f0EnvsSliced.flatMap((env, i) => {
              const num = Math.ceil(fs * (lengths[i] / speed))
              return resample(env, num)
            })
            .map((value) => value * f0Adapter)

          const length = sum(lengths)
          let kanaDuration = length / speed

          const envKeyData: EnvKeyData[] = envLenData.map((data) => {
            const envKey = data.envKey
            const envLen = data.len

            let phonemeDuration: number

            if (envLen === null) {
              phonemeDuration = kanaDuration
            } else {
              phonemeDuration = envLen / speed
            }

            if (phonemeDuration > kanaDuration) {
              phonemeDuration = kanaDuration
            }

            kanaDuration -= phonemeDuration

            if (phonemeDuration < 0) {
              phonemeDuration = 0
            }

            return {
              envKey: envKey,
              length: phonemeDuration
            }
          })

          return {
            envKeyData,
            f0Seg
          }
        })
        .filter((value) => value !== null)

        const volume = config.volume
        const whisper = (config.whisper === true)
        let prevEnd = 0

        for (let i = 0; i < dataArray.length; i++) {
          const data             = dataArray[i]
          const lengths          = data.envKeyData.map(({length}) => length)
          const numAdjustmentSec = 0.01
          const duration         = sum(lengths)
          const durationAdjusted = duration + numAdjustmentSec
          const length           = int(fs * duration)
          const lengthAdjusted   = int(fs * durationAdjusted)
          const timingRatios     = lengths.map((_, index, array) => sum(array.slice(0, index)) / durationAdjusted)
          const f0Seg            = data.f0Seg
          const phonemes         = data.envKeyData.map(({envKey}) => envKey)
          const begin            = prevEnd
          const end              = begin + lengthAdjusted

          wave = tf.tidy(() => {
            const segment = this.genWave(
              lengthAdjusted,
              f0Seg,
              volume,
              timingRatios,
              phonemes,
              voice,
              whisper
            )

            const padBefore = tf.zeros([begin])
            const padAfter = tf.zeros([Math.max(waveLen - end, 0)])

            const merged = tf.add(
              wave,
              tf.concat([
                padBefore,
                segment,
                padAfter
              ]).slice(0, waveLen)
            )

            wave.dispose()
            segment.dispose()
            padBefore.dispose()
            padAfter.dispose()

            return merged
          })

          prevEnd += length
        }

        return wave.data() as Promise<Float32Array>
      })
      .then((wave) => {
        const wav = raw2wav<Float32Array>(wave, fs, channels, dtype)
        resolve(wav)
      })
      .catch(reject)
      .finally(() => wave?.dispose())
    })

    return promise
  }

  private kanaDataToPhonemeData(data: KanaData[]) {
    const sorted = phonemes.map((value) => value).sort((a, b) => b.length - a.length)
    const joined = sorted.join('|')
    const pattern = new RegExp(`(${joined})`, 'gm')

    const converted: PhonemeData[] = data.flatMap(({kana, accent}) => {
      const index = kanas.indexOf(kana)
      const romaji = romajis[index]
      const result = romaji.match(pattern)

      if (result === null) return []

      return result.map((phoneme) => {
        return {
          phoneme: phoneme as PhonemeEnum,
          accent:  accent,
          length:  -1
        }
      })
    })

    return converted
  }

  private phonemeDataToKanaData(data: PhonemeData[]) {
    let phonemes: string = ''
    let accents: ('high' | 'low')[] = []
    let lengths: number[] = []

    const converted: KanaData[] = []

    for (let i = 0; i < data.length; i++) {
      phonemes += data[i].phoneme
      accents.push(data[i].accent)
      lengths.push(data[i].length)

      if (romajis.includes(phonemes as any)) {
        const index = romajis.indexOf(phonemes as any)
        const kana = kanas[index]
        const accent = accents[0]

        converted.push({
          kana,
          accent,
          lengths
        })

        phonemes = ''
        accents = []
        lengths = []
      }
    }

    return converted
  }

  private genPhonemeTensor(data: PhonemeData[], slidingWinLen: number) {
    mlModelOptionsSchema.shape.slidingWinLen.parse(slidingWinLen)

    const invalidValue = -1

    const numPaddingBefore = Math.ceil((slidingWinLen - 1) / 2)
    const numPaddingAfter = Math.floor((slidingWinLen - 1) / 2)

    const paddingBefore: number[] = [...new Array(numPaddingBefore)].fill(invalidValue)
    const paddingAfter: number[] = [...new Array(numPaddingAfter)].fill(invalidValue)

    const phonemeNumbers = data.map(({phoneme}) => {
      return phonemes.indexOf(phoneme) / phonemes.length
    })

    const tensor = tf.tidy(() => {
      const phonemeNumbers1d = tf.tensor([
        ...paddingBefore,
        ...phonemeNumbers,
        ...paddingAfter
      ])
      const phonemeNumbers2d = seq2seg(phonemeNumbers1d, slidingWinLen, 1)
      phonemeNumbers1d.dispose()
      return phonemeNumbers2d
    })

    return tensor
  }

  private genAccentTensor(data: PhonemeData[], slidingWinLen: number) {
    mlModelOptionsSchema.shape.slidingWinLen.parse(slidingWinLen)

    const invalidValue = -1

    const numPaddingBefore = Math.ceil((slidingWinLen - 1) / 2)
    const numPaddingAfter = Math.floor((slidingWinLen - 1) / 2)

    const paddingBefore: number[] = [...new Array(numPaddingBefore)].fill(invalidValue)
    const paddingAfter: number[] = [...new Array(numPaddingAfter)].fill(invalidValue)

    const accents = data.map(({accent}) => {
      return (accent === 'high') ? 1 : 0
    })

    const tensor = tf.tidy(() => {
      const accents1d = tf.tensor([
        ...paddingBefore,
        ...accents,
        ...paddingAfter
      ])
      const accents2d = seq2seg(accents1d, slidingWinLen, 1)
      accents1d.dispose()
      return accents2d
    })

    return tensor
  }

  private genWave(
    length: number,
    f0Seg: number[],
    volume: number,
    timingRatios: number[],
    phonemes: EnvKeyEnum[],
    voice: SpeakerVoice,
    whisper: boolean
  ) {
    const segLen  = voice.segLen
    const fs      = voice.fs
    const specLen = ((segLen % 2) === 0) ? ((segLen / 2) + 1) : ((segLen + 1) / 2)

    const specs = Object.fromEntries(
      Object.keys(voice.envelopes)
      .filter((key) => phonemes.includes(key as EnvKeyEnum))
      .map((key) => {
        const envKey = key as EnvKeyEnum
        const env = voice.envelopes[envKey]

        if (env === undefined) {
          return [
            envKey,
            linspace(0, 0, specLen)
          ]
        }

        const x: number[] = []
        const y: number[] = []
        const z = linspace(0, fs / 2, specLen)

        env.forEach((point) => {
          x.push(point[0])
          y.push(point[1])
        })

        const interpolated = interp(x, y, z)

        return [
          envKey,
          interpolated
        ]
      })
    ) as { [key in EnvKeyEnum]: number[] }

    const voicedApRatio = 12000 / fs // 24k => 0.5, 48k => 0.25
    const voicedApTanhMag = 20

    const voicedAp = tf.tidy(() => {
      return tf.div(
        tf.add(
          tf.tanh(
            tf.linspace(
              -voicedApRatio * voicedApTanhMag,
              (1 - voicedApRatio) * voicedApTanhMag,
              specLen
            )
          ),
          1
        ),
        2
      )
    })

    const unvoicedAp = tf.ones([specLen])

    const eqRatio = 2400 / fs // 24k => 0.1, 48k => 0.05
    const eqTanhMag = 20
    const eqAdd = 0.1
    const eqMul = 1 - eqAdd

    const eq = tf.tidy(() => {
      return tf.add(
        tf.mul(
          tf.div(
            tf.add(
              tf.tanh(
                tf.linspace(
                  eqRatio * eqTanhMag,
                  -(1 - eqRatio) * eqTanhMag,
                  specLen
                )
              ),
              1
            ),
            2
          ),
          eqMul
        ),
        eqAdd
      )
    })

    let wave = tf.zeros([length])
    let position = 0

    const window = tf.signal.hammingWindow(segLen)

    while (true) {
      const ratio = position / length

      const ratioApproximate = timingRatios.findLast((_ratio) => _ratio <= ratio)
      if (ratioApproximate === undefined) break

      const indexApproximate = timingRatios.indexOf(ratioApproximate)
      if (indexApproximate === -1) break

      const envKey = phonemes[indexApproximate]

      const spec = tf.tidy(() => {
        return tf.sub(
          tf.pow(
            10,
            tf.mul(
              specs[envKey],
              eq
            )
          ),
          1
        )
      })

      const isUnvoiced = ['k', 's', 'h'].includes(envKey)
      const ap = whisper ? unvoicedAp : isUnvoiced ? unvoicedAp : voicedAp

      const phase = tf.tidy(() => {
        return tf.mul(
          tf.randomUniform([specLen], 0, 2 * Math.PI),
          ap
        )
      })

      const segment = tf.tidy(() => {
        const ifft = tf.reshape(
          tf.spectral.irfft(
            tf.complex(
              tf.mul(spec, tf.cos(phase)),
              tf.mul(spec, tf.sin(phase))
            )
          ),
          [segLen]
        )

        const edited = tf.mul(
          tf.concat([
            ifft.slice(segLen / 2, segLen / 2),
            ifft.slice(0,          segLen / 2)
          ]),
          window
        )

        const max = tf.max(tf.abs(edited))
        const adjuster = tf.divNoNan([1.0], max)
        const adjusted = tf.mul(edited, adjuster)

        spec.dispose()
        phase.dispose()
        ifft.dispose()
        edited.dispose()
        max.dispose()
        adjuster.dispose()

        return adjusted
      })

      wave = tf.tidy(() => {
        const begin = position
        const end = begin + segLen
        const padBefore = tf.zeros([begin])
        const padAfter = tf.zeros([length - end])
        const merged = tf.add(
          wave,
          tf.concat([
            padBefore,
            segment,
            padAfter
          ])
        )

        wave.dispose()
        segment.dispose()
        padBefore.dispose()
        padAfter.dispose()

        return merged
      })

      position += Math.min(
        int(fs / f0Seg[position]),
        int(fs / 1)
      )

      if ((length - (position + 1)) <= segLen) {
        break
      }
    }

    let volumes = tf.zeros([length])
    let prevEnd = 0

    const firstEnvKeyIsConsonant = (
      (phonemes.length > 1) && !['a', 'i', 'u', 'e', 'o'].includes(phonemes[0])
    )
    const filterLen = int(fs * 0.05)

    for (let i = 0; i < phonemes.length; i++) {
      const envKey = phonemes[i]
      const ratio = (timingRatios.length > (i + 1)) ? timingRatios[i + 1] : 1.0
      const volume = envKeyVolumes[envKey]
      const isLastEnvKey = (i === (phonemes.length - 1))
      const numAdjust = int(filterLen / 2)
      const begin = prevEnd
      const end = Math.max(
        begin,
        Math.min(
          length,
          (
            int(length * ratio) +
            ((firstEnvKeyIsConsonant && !isLastEnvKey) ? numAdjust : 0)
          )
        )
      )

      volumes = tf.tidy(() => {
        const padBefore = tf.zeros([begin])
        const padAfter = tf.zeros([length - end])
        const merged = tf.add(
          volumes,
          tf.concat([
            padBefore,
            tf.fill([end - begin], volume),
            padAfter
          ])
        )

        volumes.dispose()
        padBefore.dispose()
        padAfter.dispose()

        return merged
      })

      prevEnd = end
    }

    volumes = tf.tidy(() => {
      const reshaped = volumes.reshape([-1, 1]) as tf.Tensor2D
      const filter = tf.signal.hammingWindow(filterLen).reshape([-1, 1, 1])
      const adjusted = tf.divNoNan(filter, tf.sum(filter)) as tf.Tensor3D
      const convolved = tf.conv1d(reshaped, adjusted, 1, 'same').reshape([-1])

      volumes.dispose()
      reshaped.dispose()
      filter.dispose()
      adjusted.dispose()

      return convolved
    })

    wave = tf.tidy(() => {
      const adjusted = tf.mul(
        wave,
        volumes
      )

      wave.dispose()

      return adjusted
    })

    wave = tf.tidy(() => {
      const waveMax = tf.max(tf.abs(wave))
      const adjuster = tf.divNoNan([volume], waveMax)
      const adjusted = tf.mul(wave, adjuster)

      wave.dispose()
      waveMax.dispose()
      adjuster.dispose()

      return adjusted
    })

    voicedAp.dispose()
    unvoicedAp.dispose()
    eq.dispose()
    window.dispose()
    volumes.dispose()

    return wave
  }
}
