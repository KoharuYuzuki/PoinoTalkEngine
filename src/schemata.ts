import { z } from 'zod'

const checkType = <T>(schema: z.ZodType<T>) => schema
const checkEven = (value: number) => (value % 2) === 0
const evenMsg   = (value: number) => ({ message: `${value} is not an even number` })

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
  'a',
  'i',
  'u',
  'e',
  'o',
  'N',
  'k',
  'kw',
  'ky',
  's',
  'sh',
  't',
  'ts',
  'ty',
  'ch',
  'n',
  'ny',
  'h',
  'hy',
  'm',
  'my',
  'y',
  'r',
  'ry',
  'w',
  'b',
  'by',
  'd',
  'dy',
  'g',
  'gw',
  'gy',
  'j',
  'v',
  'f',
  'z',
  'p',
  'py',
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

export const accents = [
  'high',
  'low'
] as const

export const speakerIds = [
  'laychie',
  'layney'
] as const

export type KanaEnum      = typeof kanas[number]
export type PhonemeEnum   = typeof phonemes[number]
export type EnvKeyEnum    = typeof envKeys[number]
export type AccentEnum    = typeof accents[number]
export type SpeakerIdEnum = typeof speakerIds[number]

export const kanaEnumSchema      = z.enum(kanas)
export const phonemeEnumSchema   = z.enum(phonemes)
export const envKeyEnumSchema    = z.enum(envKeys)
export const accentEnumSchema    = z.enum(accents)
export const speakerIdEnumSchema = z.enum(speakerIds)

export const lengthSchema  = z.number().min(0).max(10)
export const lengthsSchema = z.array(lengthSchema)
export const f0EnvSchema   = z.array(z.number().positive())
export const volEnvSchema  = z.array(z.number().nonnegative())

export const pointXSchema = z.number().min(0).max(24000)
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
  f0Env:  z.infer<typeof f0EnvSchema>
  volEnv: z.infer<typeof volEnvSchema>
}

export interface OptiDict {
  [key: string]: {
    kana:   KanaEnum
    accent: AccentEnum
  }[]
}

export interface SpeakerVoice {
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
  slidingWinLen?:   number
  f0ModelBaseFreq?: number
  f0NormMax?:       number
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
    length: lengthSchema,
    f0Env:  f0EnvSchema,
    volEnv: volEnvSchema
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
  slidingWinLen:   z.number().int().positive().optional(),
  f0ModelBaseFreq: z.number().int().min(100).max(1000).optional(),
  f0NormMax:       z.number().positive().optional()
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
