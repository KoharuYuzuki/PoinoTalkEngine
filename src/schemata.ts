import { z } from 'zod'

const checkType = <T>(schema: z.ZodType<T>) => schema
const checkEven = (value: number) => (value % 2) === 0
const evenMsg   = (value: number) => ({ message: `${value} is not an even number` })

const phonemeGroupPartition = '=== partition ==='

export const kanas = [
  '、',
  'きゃ',
  'きゅ',
  'きぇ',
  'きょ',
  'ぎゃ',
  'ぎゅ',
  'ぎぇ',
  'ぎょ',
  'くゎ',
  'ぐゎ',
  'しゃ',
  'し',
  'しゅ',
  'しぇ',
  'しょ',
  'ちゃ',
  'ち',
  'ちゅ',
  'ちぇ',
  'ちょ',
  'つぁ',
  'つぃ',
  'つ',
  'つぇ',
  'つぉ',
  'てゃ',
  'てゅ',
  'てょ',
  'でゃ',
  'でゅ',
  'でょ',
  'にゃ',
  'にゅ',
  'にぇ',
  'にょ',
  'ひゃ',
  'ひゅ',
  'ひぇ',
  'ひょ',
  'びゃ',
  'びゅ',
  'びぇ',
  'びょ',
  'ぴゃ',
  'ぴゅ',
  'ぴぇ',
  'ぴょ',
  'みゃ',
  'みゅ',
  'みぇ',
  'みょ',
  'りゃ',
  'りゅ',
  'りぇ',
  'りょ',
  'っ',
  'いぇ',
  'か',
  'き',
  'く',
  'け',
  'こ',
  'さ',
  'すぃ',
  'す',
  'せ',
  'そ',
  'た',
  'てぃ',
  'とぅ',
  'て',
  'と',
  'な',
  'に',
  'ぬ',
  'ね',
  'の',
  'は',
  'ひ',
  'へ',
  'ほ',
  'ま',
  'み',
  'む',
  'め',
  'も',
  'や',
  'ゆ',
  'よ',
  'ら',
  'り',
  'る',
  'れ',
  'ろ',
  'わ',
  'うぃ',
  'うぇ',
  'うぉ',
  'ふぁ',
  'ふぃ',
  'ふ',
  'ふぇ',
  'ふぉ',
  'ゔぁ',
  'ゔぃ',
  'ゔ',
  'ゔぇ',
  'ゔぉ',
  'が',
  'ぎ',
  'ぐ',
  'げ',
  'ご',
  'ざ',
  'ずぃ',
  'ず',
  'ぜ',
  'ぞ',
  'じゃ',
  'じ',
  'じゅ',
  'じぇ',
  'じょ',
  'だ',
  'でぃ',
  'どぅ',
  'で',
  'ど',
  'ば',
  'び',
  'ぶ',
  'べ',
  'ぼ',
  'ぱ',
  'ぴ',
  'ぷ',
  'ぺ',
  'ぽ',
  'あ',
  'い',
  'う',
  'え',
  'お',
  'ん'
] as const

export const phonemes = [
  'sil',
  'pau',
  phonemeGroupPartition,
  'a',
  'i',
  'u',
  'e',
  'o',
  phonemeGroupPartition,
  'N',
  phonemeGroupPartition,
  'k',
  'kw',
  'ky',
  phonemeGroupPartition,
  's',
  'sh',
  phonemeGroupPartition,
  't',
  'ts',
  'ty',
  phonemeGroupPartition,
  'ch',
  phonemeGroupPartition,
  'n',
  'ny',
  phonemeGroupPartition,
  'h',
  'hy',
  phonemeGroupPartition,
  'm',
  'my',
  phonemeGroupPartition,
  'y',
  phonemeGroupPartition,
  'r',
  'ry',
  phonemeGroupPartition,
  'w',
  phonemeGroupPartition,
  'b',
  'by',
  phonemeGroupPartition,
  'd',
  'dy',
  phonemeGroupPartition,
  'g',
  'gw',
  'gy',
  phonemeGroupPartition,
  'j',
  phonemeGroupPartition,
  'v',
  phonemeGroupPartition,
  'f',
  phonemeGroupPartition,
  'z',
  phonemeGroupPartition,
  'p',
  'py',
  phonemeGroupPartition,
  'cl'
] as const

export const romajis = [
  'pau',
  'kya',
  'kyu',
  'kye',
  'kyo',
  'gya',
  'gyu',
  'gye',
  'gyo',
  'kwa',
  'gwa',
  'sha',
  'shi',
  'shu',
  'she',
  'sho',
  'cha',
  'chi',
  'chu',
  'che',
  'cho',
  'tsa',
  'tsi',
  'tsu',
  'tse',
  'tso',
  'tya',
  'tyu',
  'tyo',
  'dya',
  'dyu',
  'dyo',
  'nya',
  'nyu',
  'nye',
  'nyo',
  'hya',
  'hyu',
  'hye',
  'hyo',
  'bya',
  'byu',
  'bye',
  'byo',
  'pya',
  'pyu',
  'pye',
  'pyo',
  'mya',
  'myu',
  'mye',
  'myo',
  'rya',
  'ryu',
  'rye',
  'ryo',
  'cl',
  'ye',
  'ka',
  'ki',
  'ku',
  'ke',
  'ko',
  'sa',
  'si',
  'su',
  'se',
  'so',
  'ta',
  'ti',
  'tu',
  'te',
  'to',
  'na',
  'ni',
  'nu',
  'ne',
  'no',
  'ha',
  'hi',
  'he',
  'ho',
  'ma',
  'mi',
  'mu',
  'me',
  'mo',
  'ya',
  'yu',
  'yo',
  'ra',
  'ri',
  'ru',
  're',
  'ro',
  'wa',
  'wi',
  'we',
  'wo',
  'fa',
  'fi',
  'fu',
  'fe',
  'fo',
  'va',
  'vi',
  'vu',
  've',
  'vo',
  'ga',
  'gi',
  'gu',
  'ge',
  'go',
  'za',
  'zi',
  'zu',
  'ze',
  'zo',
  'ja',
  'ji',
  'ju',
  'je',
  'jo',
  'da',
  'di',
  'du',
  'de',
  'do',
  'ba',
  'bi',
  'bu',
  'be',
  'bo',
  'pa',
  'pi',
  'pu',
  'pe',
  'po',
  'a',
  'i',
  'u',
  'e',
  'o',
  'N'
] as const

export const envKeys = [
  'a',
  'i',
  'u',
  'e',
  'o',
  'k',
  's',
  't',
  'n',
  'h',
  'm',
  'y',
  'r',
  'w',
  'g',
  'z',
  'd',
  'b',
  'p',
  'v',
  'q'
] as const

export const envKeyVolumes: Readonly<{
  [key in typeof envKeys[number]]: number
}> = {
  'a': 1.00,
  'i': 1.00,
  'u': 1.00,
  'e': 1.00,
  'o': 1.00,
  'k': 0.05,
  's': 0.05,
  't': 0.30,
  'n': 1.00,
  'h': 0.10,
  'm': 1.00,
  'y': 1.00,
  'r': 1.00,
  'w': 1.00,
  'g': 0.30,
  'z': 0.30,
  'd': 0.30,
  'b': 0.30,
  'p': 0.05,
  'v': 0.30,
  'q': 1.00
}

export const accents = [
  'high',
  'low'
] as const

export const speakerIds = [
  'laychie',
  'layney'
] as const

export type KanaEnum      = typeof kanas[number]
export type PhonemeEnum   = Exclude<typeof phonemes[number], typeof phonemeGroupPartition>
export type EnvKeyEnum    = typeof envKeys[number]
export type AccentEnum    = typeof accents[number]
export type SpeakerIdEnum = typeof speakerIds[number]

export const kanaEnumSchema      = z.enum(kanas)
export const phonemeEnumSchema   = z.enum(phonemes).exclude([phonemeGroupPartition])
export const envKeyEnumSchema    = z.enum(envKeys)
export const accentEnumSchema    = z.enum(accents)
export const speakerIdEnumSchema = z.enum(speakerIds)

export const lengthSchema  = z.number().min(0).max(10)
export const lengthsSchema = z.array(lengthSchema)
export const f0SegSchema   = z.array(z.number().min(1))
export const volEnvSchema  = z.array(z.number().nonnegative())

export const pointXSchema = z.number().min(0).max(48000)
export const pointYSchema = z.number().min(0).max(1)
export const pointSchema  = z.tuple([pointXSchema, pointYSchema])
export const pointsSchema = z.array(pointSchema)

export const envRecordSchema  = z.record(envKeyEnumSchema, pointsSchema)
export const envLenSchema     = z.object({ envKey: envKeyEnumSchema, len: z.number().min(0).nullable() })
export const kanaRecordSchema = z.record(kanaEnumSchema, z.array(envLenSchema))

export interface KanaData {
  kana:    KanaEnum
  accent:  AccentEnum
  lengths: z.infer<typeof lengthsSchema>
}

export interface PhonemeData {
  phoneme: PhonemeEnum
  accent:  AccentEnum
  length:  z.infer<typeof lengthSchema>
}

export interface EnvKeyData {
  envKey: EnvKeyEnum
  length: z.infer<typeof lengthSchema>
}

export interface OptiDict {
  [key: string]: {
    kana:   KanaEnum
    accent: AccentEnum
  }[]
}

export interface SpeakerVoice {
  id:        SpeakerIdEnum
  name:      string
  fs:        number
  segLen:    number
  hopLen:    number
  baseFreq:  number
  envelopes: z.infer<typeof envRecordSchema>
  kanas:     z.infer<typeof kanaRecordSchema>
}

export interface SynthConfig {
  speed:    number
  volume:   number
  pitch:    number
  whisper?: boolean
}

export interface MlModelOptions {
  slidingWinLen:   number
  f0ModelBaseFreq: number
  f0NormMax:       number
}

export const kanaDataArraySchema = z.array(
  z.object({
    kana:    kanaEnumSchema,
    accent:  accentEnumSchema,
    lengths: lengthsSchema
  })
)

export const phonemeDataArraySchema = z.array(
  z.object({
    phoneme: phonemeEnumSchema,
    accent:  accentEnumSchema,
    length:  lengthSchema
  })
)

export const envKeyDataArraySchema = z.array(
  z.object({
    envKey: envKeyEnumSchema,
    length: lengthSchema
  })
)

export const optiDictSchema = z.record(
  z.string(),
  z.array(
    z.object({
      kana:   kanaEnumSchema,
      accent: accentEnumSchema
    })
  )
)

export const speakerVoiceSchema = z.object({
  id:        speakerIdEnumSchema,
  name:      z.string(),
  fs:        z.number().int().min(12000).max(48000),
  segLen:    z.number().int().min(120).refine(checkEven, evenMsg),
  hopLen:    z.number().int().min(30),
  baseFreq:  z.number().int().min(100).max(1000),
  envelopes: envRecordSchema,
  kanas:     kanaRecordSchema
})

export const synthConfigSchema = z.object({
  speed:   z.number().min(0.5).max(2),
  volume:  z.number().min(0).max(1),
  pitch:   z.number().min(0.5).max(2),
  whisper: z.boolean().optional()
})

export const mlModelOptionsSchema = z.object({
  slidingWinLen:   z.number().int().positive(),
  f0ModelBaseFreq: z.number().min(100).max(1000),
  f0NormMax:       z.number().positive()
})

checkType<KanaEnum>(kanaEnumSchema)
checkType<PhonemeEnum>(phonemeEnumSchema)
checkType<EnvKeyEnum>(envKeyEnumSchema)
checkType<AccentEnum>(accentEnumSchema)
checkType<KanaData[]>(kanaDataArraySchema)
checkType<PhonemeData[]>(phonemeDataArraySchema)
checkType<EnvKeyData[]>(envKeyDataArraySchema)
checkType<OptiDict>(optiDictSchema)
checkType<SpeakerVoice>(speakerVoiceSchema)
checkType<SynthConfig>(synthConfigSchema)
checkType<MlModelOptions>(mlModelOptionsSchema)
