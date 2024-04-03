import openjlabel from 'openjlabel'
import type { OpenjlabelInstance } from 'openjlabel'
import { join } from 'pathe'
import { optiDictSchema, kanas, phonemes, romajis } from './schemata'
import type { OptiDict, KanaData, PhonemeData, PhonemeEnum } from './schemata'
import { isString } from './utils'

export class TextAnalyzer {
  private openjlabelInstance: OpenjlabelInstance | null
  private openjlabelDictDirPath: string
  private openjlabelTmpFilePath: string

  private systemDict: OptiDict
  private userDict:   OptiDict

  constructor() {
    this.openjlabelInstance = null
    this.openjlabelDictDirPath = '/dict'
    this.openjlabelTmpFilePath = 'tmp.lab'

    this.systemDict = {}
    this.userDict   = {}
  }

  init() {
    if (this.openjlabelInstance !== null) {
      throw new Error('openjlabel instance is already initialized')
    }

    return (
      openjlabel()
      .then((instance) => {
        this.openjlabelInstance = instance
      })
      .catch(console.error)
    )
  }

  loadOpenjlabelDict(files: { fileName: string, data: Uint8Array }[]) {
    if (this.openjlabelInstance === null) {
      throw new Error(
        `openjlabel instance is null, call "${this.loadOpenjlabelDict.name}" after calling "${this.init.name}"`
      )
    }

    const memoryFS = this.openjlabelInstance.FS

    memoryFS.mkdir(this.openjlabelDictDirPath)

    files.forEach((file) => {
      const dictFilePath = join(this.openjlabelDictDirPath, file.fileName)
      const data = file.data

      memoryFS.writeFile(dictFilePath, data)
    })
  }

  loadSystemDict(dict: OptiDict) {
    this.loadOptiDict(dict, 'system')
  }

  loadUserDict(dict: OptiDict) {
    this.loadOptiDict(dict, 'user')
  }

  clearUserDict() {
    this.userDict = {}
  }

  analyze(text: string) {
    const optiDictApplied = this.applyOptiDict(text)

    const kanaDataArray = optiDictApplied.flatMap((item) => {
      if (isString(item)) {
        return this.textToKanaData(item as string)
      } else {
        return item as KanaData[]
      }
    })

    if (kanaDataArray.length > 0) {
      const dataLen = kanaDataArray.length
      const lastData = kanaDataArray[dataLen - 1]

      if (lastData.kana === '、') {
        kanaDataArray.pop()
      }
    }

    return kanaDataArray
  }

  private loadOptiDict(dict: OptiDict, type: 'system' | 'user') {
    optiDictSchema.parse(dict)

    Object.keys(dict).forEach((key) => {
      if (type === 'system') {
        this.systemDict[key] = dict[key]
      } else {
        this.userDict[key] = dict[key]
      }
    })
  }

  private applyOptiDict(text: string) {
    const dictionaries = [
      Object.fromEntries(Object.entries(this.userDict).sort((a, b) => a[0].length - b[0].length)),
      Object.fromEntries(Object.entries(this.systemDict).sort((a, b) => a[0].length - b[0].length))
    ]
    let applied: (KanaData[] | string)[] = [text]

    dictionaries.forEach((dict) => {
      Object.keys(dict).forEach((key) => {
        applied = applied.flatMap((item) => {
          if (!isString(item)) {
            return [item]
          } else {
            return (item as string).split(key).flatMap((item, index, array) => {
              if (index < (array.length - 1)) {
                return [
                  item,
                  dict[key].map((item) => ({
                    kana:    item.kana,
                    accent:  item.accent,
                    lengths: []
                  }))
                ]
              } else {
                return item
              }
            })
          }
        }).filter((item) => item !== '')
      })
    })

    return applied
  }

  private textToKanaData(text: string) {
    if (this.openjlabelInstance === null) {
      throw new Error(
        `openjlabel instance is null, call "${this.textToKanaData.name}" after calling "${this.init.name}"`
      )
    }

    const args = [
      '-d', this.openjlabelDictDirPath,
      '-o', this.openjlabelTmpFilePath,
      text
    ]

    this.openjlabelInstance.callMain(args)

    const label = this.openjlabelInstance.FS.readFile(
      this.openjlabelTmpFilePath,
      { encoding: 'utf8' }
    )

    const phonemeDataArray = this.parseLabel(label)
    const kanaDataArray = this.phonemeDataToKanaData(phonemeDataArray)

    return kanaDataArray
  }

  private parseLabel(label: string) {
    const pattern = new RegExp(
      '^[a-z]+\\^[a-z]+-(?<phoneme>[a-z]+)\\+[a-z]+=[a-z]+\\/A:(?<accentPos>-*[0-9|a-z]+)\\+(?<accentAsc>[0-9|a-z]+)\\+(?<accentDesc>[0-9|a-z]+)',
      'gmi'
    )

    const matched = [...label.matchAll(pattern)]
    const minMatchedLen = 3

    if (matched.length < minMatchedLen) return []

    const matchedStripped = matched.slice(1, -1)

    const accentGroups: {
      phoneme:   string
      accentPos: number | null
    }[][] = []

    let prevAccentAsc  = 2
    let prevAccentDesc = 1

    for (let i = 0; i < matchedStripped.length; i++) {
      const groups = matchedStripped[i].groups

      if (groups === undefined) continue

      const phoneme    = groups.phoneme
      const accentPos  = (groups.accentPos !== 'xx')  ? Number(groups.accentPos)  : null
      const accentAsc  = (groups.accentAsc !== 'xx')  ? Number(groups.accentAsc)  : null
      const accentDesc = (groups.accentDesc !== 'xx') ? Number(groups.accentDesc) : null

      if (
        (accentAsc === null) ||
        (accentDesc === null) ||
        (prevAccentAsc > accentAsc) ||
        (prevAccentDesc < accentDesc)
      ) {
        accentGroups.push([])
      }

      accentGroups[accentGroups.length - 1].push({
        phoneme,
        accentPos
      })

      prevAccentAsc  = (accentAsc !== null) ? accentAsc : 2
      prevAccentDesc = (accentDesc !== null) ? accentDesc : 1
    }

    const parsed = accentGroups.flatMap((accentGroup) => {
      const accentPosArray = accentGroup.map(({ accentPos }) => accentPos)
      const accentPosSet = [...new Set(accentPosArray)]
      const accentPosSetLen = accentPosSet.length

      const high = 'high'
      const low = 'low'

      let accents: ('high' | 'low')[]

      if (accentPosSet.includes(null)) {
        accents = [...new Array(accentPosSetLen)].fill(low)
      } else {
        const index = accentPosSet.indexOf(0)

        if (index === 0) {
          accents = [
            high,
            ...[...new Array(accentPosSetLen - 1)].fill(low)
          ]
        } else if (index >= 1) {
          accents = [
            low,
            ...[...new Array(index)].fill(high),
            ...[...new Array(accentPosSetLen - (index + 1))].fill(low)
          ]
        } else {
          accents = [...new Array(accentPosSetLen)].fill(low)
        }
      }

      const parsed: PhonemeData[] = []
      let prevAccentPos: number | null = null
      let groupItemIndex = 0

      accentPosArray.forEach((accentPos) => {
        if ((prevAccentPos === accentPos) && (accentPos !== null)) return

        const accentNum = accentPosArray.filter((item) => item === accentPos).length
        const shifted = accents.shift()
        const accent = (shifted !== undefined) ? shifted : 'low'

        for (let i = 0; i < accentNum; i++) {
          let phonemeStr = accentGroup[groupItemIndex].phoneme
          let phonemeTyped: PhonemeEnum

          if (phonemeStr !== 'N') {
            phonemeStr = phonemeStr.toLowerCase()
          }

          if (phonemes.includes(phonemeStr as any)) {
            phonemeTyped = phonemeStr as PhonemeEnum
          } else {
            phonemeTyped = phonemes[0]
          }

          parsed.push({
            phoneme: phonemeTyped,
            accent:  accent,
            length:  -1
          })

          groupItemIndex++
        }

        prevAccentPos = accentPos
      })

      return parsed
    })

    return parsed
  }

  private phonemeDataToKanaData(data: PhonemeData[]) {
    let phonemes: string = ''
    let accents: ('high' | 'low')[] = []

    const converted: KanaData[] = []

    for (let i = 0; i < data.length; i++) {
      phonemes += data[i].phoneme
      accents.push(data[i].accent)

      if (romajis.includes(phonemes as any)) {
        const index = romajis.indexOf(phonemes as any)
        const kana = kanas[index]
        const accent = accents[0]

        converted.push({
          kana:    kana,
          accent:  accent,
          lengths: []
        })

        phonemes = ''
        accents = []
      }
    }

    return converted
  }
}
