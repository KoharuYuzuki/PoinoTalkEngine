import * as tf from '@tensorflow/tfjs'
import { TextAnalyzer } from './text-analyzer'
import {
  mlModelOptionsSchema, kanas, phonemes, romajis,
  kanaDataArraySchema, speakerVoiceSchema, synthConfigSchema
} from './schemata'
import type {
  MlModelOptions, OptiDict, KanaData, PhonemeData, EnvKeyData,
  PhonemeEnum, EnvKeyEnum, SpeakerVoice, SynthConfig
} from './schemata'
import {
  isBrowser, canUseWebGPU, canUseWebGL, seq2seg, seg2seq,
  raw2wav, interpZeros, resample, sum, avg, int, linspace, interp,
  computeSeq2segLen, computeSeg2seqLen, adaptVolume
} from './utils'
import { systemDict } from './system-dict'
import { laychieVoice } from './speakers/laychie'
import { layneyVoice } from './speakers/layney'
import { resolve } from 'pathe'

export class PoinoTalkEngine {
  private textAnalyzer: TextAnalyzer
  private textAnalyzerInitialized: boolean

  private durationModel: tf.LayersModel | null
  private f0Model:       tf.LayersModel | null
  private volumeModel:   tf.LayersModel | null

  private slidingWinLen:   number | null
  private f0ModelBaseFreq: number | null
  private f0NormMax:       number | null

  constructor() {
    this.textAnalyzer = new TextAnalyzer()
    this.textAnalyzerInitialized = false

    this.durationModel = null
    this.f0Model       = null
    this.volumeModel   = null

    this.slidingWinLen   = null
    this.f0ModelBaseFreq = null
    this.f0NormMax       = null
  }

  init(initTextAnalyzer: boolean = true) {
    if (this.textAnalyzerInitialized === true) {
      throw new Error('text analyzer is already initialized')
    }

    let promise: Promise<void>

    if (initTextAnalyzer) {
      this.loadSystemDict(systemDict)

      promise =
        this.textAnalyzer.init()
        .then(() => {
          this.textAnalyzerInitialized = true
        })
    } else {
      promise = Promise.resolve()
    }

    return (
      promise
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
      .catch(console.error)
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
    modelJsonPaths: { [key in 'duration' | 'f0' | 'volume']: string },
    options: MlModelOptions
  ) {
    mlModelOptionsSchema.parse(options)

    this.slidingWinLen   = options.slidingWinLen
    this.f0ModelBaseFreq = options.f0ModelBaseFreq
    this.f0NormMax       = options.f0NormMax

    if (!isBrowser) {
      modelJsonPaths.duration = `file://${resolve(modelJsonPaths.duration)}`
      modelJsonPaths.f0       = `file://${resolve(modelJsonPaths.f0)}`
      modelJsonPaths.volume   = `file://${resolve(modelJsonPaths.volume)}`
    }

    return (
      Promise.all([
        tf.loadLayersModel(modelJsonPaths.duration),
        tf.loadLayersModel(modelJsonPaths.f0),
        tf.loadLayersModel(modelJsonPaths.volume)
      ])
      .then(([durationModel, f0Model, volumeModel]) => {
        this.durationModel = durationModel
        this.f0Model       = f0Model
        this.volumeModel   = volumeModel
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
    config: SynthConfig,
    f0Env?: number[][],
    volEnv?: number[][],
    raw?: boolean
  ) {
    let synthesizePromise: Promise<Float32Array> = Promise.resolve(new Float32Array())

    tf.tidy(() => {
      synthesizePromise = this._synthesizeVoice(
        analyzedData,
        speakerVoice,
        config,
        f0Env,
        volEnv,
        raw
      )
    })

    return synthesizePromise
  }

  getSpeakers() {
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
          `slidingWinLen is null, "${this.loadMlModels.name}" must be called first`
        )
      }

      return this.genPhonemeTensor(phonemeDataArray, this.slidingWinLen)
    })

    const predicted = tf.tidy(() => {
      if (this.durationModel === null) {
        throw new Error(
          `duration model is null, "${this.loadMlModels.name}" must be called first`
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
    config: SynthConfig,
    f0Envs?: number[][],
    volEnvs?: number[][],
    raw?: boolean
  ) {
    kanaDataArraySchema.parse(analyzedData)
    speakerVoiceSchema.parse(speakerVoice)
    synthConfigSchema.parse(config)

    const voice    = speakerVoice
    const fs       = speakerVoice.fs
    const channels = 1
    const dtype    = Float32Array

    const totalLength = sum(analyzedData.flatMap((data) => data.lengths))

    if (totalLength <= 0) {
      const raw = new Float32Array()
      const wav = raw2wav<Float32Array>(raw, fs, channels, dtype)
      return Promise.resolve(wav)
    }

    let f0EnvsPromise:  Promise<number[][]>
    let volEnvsPromise: Promise<number[][]>

    const useSpecifiedEnvs = f0Envs && volEnvs

    if (useSpecifiedEnvs) {
      f0EnvsPromise = Promise.resolve(f0Envs)
      volEnvsPromise = Promise.resolve(volEnvs)
    } else {
      const phonemeDataArray = this.kanaDataToPhonemeData(analyzedData)

      const phonemeTensor = tf.tidy(() => {
        if (this.slidingWinLen === null) {
          throw new Error(
            `slidingWinLen is null, "${this.loadMlModels.name}" must be called first`
          )
        }

        return this.genPhonemeTensor(phonemeDataArray, this.slidingWinLen)
      })

      const accentTensor = tf.tidy(() => {
        if (this.slidingWinLen === null) {
          throw new Error(
            `slidingWinLen is null, "${this.loadMlModels.name}" must be called first`
          )
        }

        return this.genAccentTensor(phonemeDataArray, this.slidingWinLen)
      })

      const f0Predicted = tf.tidy(() => {
        if (this.f0Model === null) {
          throw new Error(
            `f0 model is null, "${this.loadMlModels.name}" must be called first`
          )
        }

        const predicted = this.f0Model.apply([phonemeTensor, accentTensor], { training: false }) as tf.Tensor

        tf.keep(phonemeTensor)
        tf.keep(accentTensor)
        tf.keep(predicted)

        return predicted
      })

      const volPredicted = tf.tidy(() => {
        if (this.volumeModel === null) {
          throw new Error(
            `volume model is null, "${this.loadMlModels.name}" must be called first`
          )
        }

        const predicted = this.volumeModel.apply([phonemeTensor, accentTensor], { training: false }) as tf.Tensor

        tf.keep(phonemeTensor)
        tf.keep(accentTensor)
        tf.keep(predicted)

        return predicted
      })

      f0EnvsPromise = (f0Predicted.array() as Promise<number[][]>)
      volEnvsPromise = (volPredicted.array() as Promise<number[][]>)

      Promise.all([f0EnvsPromise, volEnvsPromise])
      .finally(() => {
        phonemeTensor.dispose()
        accentTensor.dispose()
        f0Predicted.dispose()
        volPredicted.dispose()
      })
    }

    const promise = new Promise<Float32Array>((resolve, reject) => {
      let waveVolAdjusted: tf.Tensor | null = null

      Promise.all([f0EnvsPromise, volEnvsPromise])
      .then(([f0Envs, volEnvs]) => {
        if (!useSpecifiedEnvs) {
          if (this.f0NormMax === null) {
            throw new Error(
              `f0NormMax is null, "${this.loadMlModels.name}" must be called first`
            )
          }

          const f0NormMax = this.f0NormMax
          const pitch = config.pitch

          f0Envs = f0Envs.map((env) => interpZeros(env).map((value) => value * f0NormMax * pitch))
          volEnvs = volEnvs.map((env) => interpZeros(env))
        }

        const envKeyData = this.genEnvKeyData(
          analyzedData,
          f0Envs,
          volEnvs,
          voice,
          config.speed
        )

        if (this.f0ModelBaseFreq === null) {
          throw new Error(
            `f0ModelBaseFreq is null, "${this.loadMlModels.name}" must be called first`
          )
        }

        const lengths     = envKeyData.map(({length}) => length)
        const times       = lengths.map((_, index, array) => sum(array.slice(0, index + 1)))
        const duration    = sum(lengths)
        const durationLen = int(fs * duration)
        const f0Adapter   = voice.baseFreq / this.f0ModelBaseFreq
        const f0EnvSeq    = envKeyData.flatMap(({f0Env}) => f0Env).map((value) => value * f0Adapter)
        const volEnvSeq   = envKeyData.flatMap(({volEnv}) => volEnv)

        let baseWave: tf.Tensor

        if (config.whisper) {
          baseWave = this.genRandWave(durationLen)
        } else {
          baseWave = this.genSinWave(durationLen, fs, f0EnvSeq)
        }

        const waveSegs = this.applyEnvToWave(
          durationLen,
          baseWave,
          times,
          envKeyData,
          voice
        )

        const volSrc = this.genVolSrc(
          waveSegs.shape[0],
          voice.segLen,
          voice.hopLen,
          volEnvSeq
        )

        const waveSegsVolAdapted = this.adaptVolume(waveSegs, volSrc)

        const wave = tf.tidy(() => {
          const wave = seg2seq(waveSegsVolAdapted, voice.segLen, voice.hopLen)
          waveSegsVolAdapted.dispose()
          return wave
        })

        waveVolAdjusted = this.adjustVolume(wave, config.volume)

        return waveVolAdjusted.data() as Promise<Float32Array>
      })
      .then((wave) => {
        if (raw) {
          resolve(wave)
        } else {
          const wav = raw2wav<Float32Array>(wave, fs, channels, dtype)
          resolve(wav)
        }
      })
      .catch(reject)
      .finally(() => waveVolAdjusted?.dispose())
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

  private genEnvKeyData(
    data: KanaData[],
    f0Envs: number[][],
    volEnvs: number[][],
    voice: SpeakerVoice,
    speed: number
  ) {
    const phonemeDataLen = this.kanaDataToPhonemeData(data).length
    const f0EnvsLen = f0Envs.length
    const volEnvsLen = volEnvs.length

    if (f0EnvsLen !== phonemeDataLen) {
      throw new Error('length of "f0Env" does not match the length of "phonemeData"')
    }

    if (volEnvsLen !== phonemeDataLen) {
      throw new Error('length of "volEnv" does not match the length of "phonemeData"')
    }

    speakerVoiceSchema.parse(voice)
    synthConfigSchema.shape.speed.parse(speed)

    const fs = voice.fs
    let envsIndex = 0

    const envKeyData: EnvKeyData[] = data.flatMap(({kana, accent, lengths}, index) => {
      const envLenData = voice.kanas[kana]
      if (envLenData === undefined) return []

      const lengthsLen = lengths.length
      const phonemeDataLen = this.kanaDataToPhonemeData([{ kana, accent, lengths }]).length
      if (lengthsLen !== phonemeDataLen) {
        throw new Error(`number of elements in "lengths" of number ${index} in "data" is invalid`)
      }

      const begin = envsIndex
      const end   = begin + lengthsLen

      envsIndex = end

      const f0EnvsSliced  = f0Envs.slice(begin, end)
      const volEnvsSliced = volEnvs.slice(begin, end)

      const f0Env = f0EnvsSliced.flatMap((env, index) => {
        const num = Math.ceil(fs * (lengths[index] / speed))
        return resample(env, num)
      })

      const volEnv = volEnvsSliced.flatMap((env, index) => {
        const num = Math.ceil(fs * (lengths[index] / speed))
        return resample(env, num)
      })

      const length = sum(lengths)
      let kanaLen = length / speed
      let envIndex = 0

      return envLenData.map(({envKey, len}) => {
        let phonemeLen: number

        if (len === null) {
          phonemeLen = kanaLen
        } else {
          phonemeLen = len / speed
        }

        if (phonemeLen > kanaLen) {
          phonemeLen = kanaLen
        }

        kanaLen -= phonemeLen

        if (phonemeLen < 0) {
          phonemeLen = 0
        }

        const num   = Math.ceil(fs * phonemeLen)
        const begin = envIndex
        const end   = begin + num

        envIndex = end

        const f0EnvSliced  = f0Env.slice(begin, end)
        const volEnvSliced = volEnv.slice(begin, end)

        return {
          envKey: envKey,
          length: phonemeLen,
          f0Env:  f0EnvSliced,
          volEnv: volEnvSliced
        }
      })
    })

    return envKeyData
  }

  private genRandWave(length: number) {
    const min = -1
    const max = 1
    return tf.randomUniform([length], min, max)
  }

  private genSinWave(
    length: number,
    fs: number,
    f0EnvSeq: number[]
  ) {
    const segLen = int(fs * 0.01)
    const hopLen = segLen

    const segsLen = computeSeq2segLen(length, segLen, hopLen)

    const baseFreq = avg(f0EnvSeq)
    const numFreqs = int((fs / 2) / baseFreq)
    const freqs    = [...new Array(numFreqs)].map((_, index) => baseFreq * (index + 1))

    const freqMags: number[] = []

    for (let i = 0; i < segsLen; i++) {
      const begin = hopLen * i
      const end = begin + segLen
      const f0Env = f0EnvSeq.slice(begin, end)
      const f0Avg = avg(f0Env)
      freqMags.push(f0Avg / baseFreq)
    }

    const freqsTensor = tf.tidy(() => {
      return tf.add([freqs], [0]).reshape([-1, 1])
    })

    const phaseTensor = tf.tidy(() => {
      return tf.divNoNan(
        [Math.PI],
        tf.randomUniform(freqsTensor.shape)
      )
    })

    const sinWaveSegs: tf.Tensor[] = []
    let prevEnd = 0

    for (let i = 0; i < segsLen; i++) {
      const begin = prevEnd
      const end = begin + (segLen / fs * freqMags[i])
      const time = linspace(begin, end, segLen + 1).slice(1)
      const sinWave = tf.tidy(() => {
        return tf.sin(
          tf.add(
            tf.mul(
              tf.mul([2 * Math.PI], freqsTensor),
              time
            ),
            phaseTensor
          )
        )
      })
      sinWaveSegs.push(sinWave)
      prevEnd = time.slice(-1)[0]
    }

    freqsTensor.dispose()
    phaseTensor.dispose()

    return tf.tidy(() => {
      const sinWaves = tf.concat(sinWaveSegs, 1)
      const sinWave = tf.sum(sinWaves, 0)
      const sinWaveDivided = tf.divNoNan(sinWave, [numFreqs])

      tf.dispose(sinWaveSegs)
      sinWaves.dispose()
      sinWave.dispose()

      return sinWaveDivided
    })
  }

  private applyEnvToWave(
    length: number,
    wave: tf.Tensor,
    times: number[],
    envKeyData: EnvKeyData[],
    voice: SpeakerVoice
  ) {
    const segLen = voice.segLen
    const hopLen = voice.hopLen
    const fs     = voice.fs

    const segsLen = computeSeq2segLen(length, segLen, hopLen)

    const waveSegs = tf.tidy(() => {
      const segs = seq2seg(wave, segLen, hopLen)
      const win = tf.signal.hammingWindow(segLen)
      const multiplied = tf.mul(segs, win)

      wave.dispose()
      segs.dispose()
      win.dispose()

      return multiplied
    })

    const specSegs = tf.tidy(() => {
      const comp = tf.cast(waveSegs, 'complex64')
      const fft = tf.spectral.fft(comp)

      waveSegs.dispose()
      comp.dispose()

      return fft
    })

    const envs = Object.fromEntries(
      Object.keys(voice.envelopes).map((key) => {
        const envKey = key as EnvKeyEnum
        const env = voice.envelopes[envKey]

        if (env === undefined) {
          return [
            envKey,
            linspace(0, 0, int(segLen / 2))
          ]
        }

        const x: number[] = []
        const y: number[] = []
        const z = linspace(0, fs / 2, int(segLen / 2))

        env.forEach((point) => {
          x.push(point[0])
          y.push(Math.pow(10, point[1]) - 1)
        })

        const interpolated = interp(x, y, z)

        return [
          envKey,
          [
            ...interpolated,
            ...interpolated.reverse()
          ]
        ]
      })
    ) as { [key in EnvKeyEnum]: number[] }

    const envSegs: number[][] = []

    for (let i = 0; i < segsLen; i++) {
      const begin = hopLen * i
      const beginSec = begin / fs

      const timeApproximate = times.find((time) => time >= beginSec)
      if (timeApproximate === undefined) continue

      const indexApproximate = times.indexOf(timeApproximate)
      if (indexApproximate === -1) continue

      const envKey = envKeyData[indexApproximate].envKey
      const env = envs[envKey]

      envSegs.push(env)
    }

    const envSegsTensor = tf.tensor(envSegs)

    return tf.tidy(() => {
      const multiplied = tf.mul(specSegs, envSegsTensor)
      const ifft = tf.spectral.ifft(multiplied)
      const real = tf.real(ifft)

      specSegs.dispose()
      envSegsTensor.dispose()
      multiplied.dispose()
      ifft.dispose()

      return real
    })
  }

  private genVolSrc(
    segsLen: number,
    segLen: number,
    hopLen: number,
    volEnvSeq: number[]
  ) {
    return tf.tidy(() => {
      const durationLen = computeSeg2seqLen(segsLen, segLen, hopLen)
      const volEnvSeqTensor = tf.tensor(volEnvSeq.slice(0, durationLen))
      const volEnvSegs = seq2seg(volEnvSeqTensor, segLen, hopLen)

      volEnvSeqTensor.dispose()

      return volEnvSegs
    })
  }

  private adaptVolume(
    waveSegs: tf.Tensor,
    volSrc: tf.Tensor
  ) {
    return tf.tidy(() => {
      const adapted = adaptVolume(waveSegs, volSrc)

      waveSegs.dispose()
      volSrc.dispose()

      return adapted
    })
  }

  private adjustVolume(
    wave: tf.Tensor,
    volume: number
  ) {
    return tf.tidy(() => {
      const waveMax = tf.max(tf.abs(wave))
      const adapter = tf.divNoNan([volume], waveMax)
      const multiplied = tf.mul(wave, adapter)

      wave.dispose()
      waveMax.dispose()
      adapter.dispose()

      return multiplied
    })
  }
}
