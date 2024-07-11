import * as tf from '@tensorflow/tfjs'
import { z } from 'zod'

declare var importScripts: Function

export const isBrowser = (typeof window !== 'undefined') || (typeof importScripts !== 'undefined')

export const canUseWebGPU = isBrowser && ('gpu' in navigator)
export const canUseWebGL  = isBrowser && (new OffscreenCanvas(0, 0).getContext('webgl') !== null)

export function isString (value: any) {
  const result = z.string().safeParse(value)
  return result.success
}

export function checkPositiveInt (value: any) {
  z.number().int().positive().parse(value)
}

export function checkNonNegativeInt (value: any) {
  z.number().int().nonnegative().parse(value)
}

export function int (value: number) {
  return Math.floor(value)
}

export function seq2seg (
  sequence: tf.Tensor,
  segLen: number,
  hopLen: number
) {
  checkPositiveInt(segLen)
  checkPositiveInt(hopLen)

  const sequenceLen = sequence.shape[0]
  const segmentsLen = computeSeq2segLen(sequenceLen, segLen, hopLen)
  const segments: tf.Tensor[] = []

  for (let i = 0; i < segmentsLen; i++) {
    const begin = hopLen * i
    const end = begin + segLen

    let segment = sequence.slice(
      (begin >= 0) ? begin : 0,
      (end <= sequenceLen) ? segLen: sequenceLen - begin
    )
    const segmentLen = segment.shape[0]

    if (segmentLen < segLen) {
      const padding = tf.zeros([segLen - segmentLen, ...sequence.shape.slice(1)])
      segment = segment.concat(padding)
      padding.dispose()
    }

    segments.push(segment)
  }

  const concatenated = tf.tidy(() => {
    const concatenated = tf.concat(segments).reshape([segmentsLen, segLen])
    tf.dispose(segments)
    return concatenated
  })

  return concatenated
}

export function seg2seq (
  segments: tf.Tensor,
  segLen: number,
  hopLen: number
) {
  checkPositiveInt(segLen)
  checkPositiveInt(hopLen)

  const segmentsLen = segments.shape[0]
  const sequenceLen = computeSeg2seqLen(segmentsLen, segLen, hopLen)
  let sequence = tf.zeros([sequenceLen, ...segments.shape.slice(2)])

  for (let i = 0; i < segmentsLen; i++) {
    const begin = hopLen * i
    const end = begin + segLen

    const segment = segments.slice(i, 1).reshape([-1, ...segments.shape.slice(2)])
    const paddingBefore = tf.zeros([begin, ...segment.shape.slice(1)])
    const paddingAfter = tf.zeros([sequenceLen - end, ...segment.shape.slice(1)])

    sequence = tf.tidy(() => {
      const merged = tf.add(
        sequence,
        tf.concat([paddingBefore, segment, paddingAfter])
      )
      sequence.dispose()
      segment.dispose()
      paddingBefore.dispose()
      paddingAfter.dispose()
      return merged
    })
  }

  return sequence
}

export function computeSeq2segLen (
  sequenceLen: number,
  segLen: number,
  hopLen: number
) {
  checkPositiveInt(sequenceLen)
  checkPositiveInt(segLen)
  checkPositiveInt(hopLen)

  if ((sequenceLen >= segLen) && (hopLen > 0)) {
    return Math.ceil((sequenceLen / hopLen) - (segLen / hopLen) + 1)
  } else {
    return 1
  }
}

export function computeSeg2seqLen (
  segmentsLen: number,
  segLen: number,
  hopLen: number
) {
  checkPositiveInt(segmentsLen)
  checkPositiveInt(segLen)
  checkPositiveInt(hopLen)

  return hopLen * (segmentsLen - 1) + segLen
}

export function adaptVolume (segments: tf.Tensor, volumeSrc: tf.Tensor) {
  const adapter = tf.tidy(() => {
    const volumeSrcMax = tf.max(tf.abs(volumeSrc), 1)
    const segmentsMax = tf.max(tf.abs(segments), 1)
    const adapter = tf.divNoNan(volumeSrcMax, segmentsMax).reshape([-1, 1])

    volumeSrcMax.dispose()
    segmentsMax.dispose()

    return adapter
  })

  const adapted = tf.tidy(() => tf.mul(segments, adapter))

  return adapted
}

export function raw2wav <T> (
  raw: Uint8Array | Uint16Array | Float32Array,
  fs: number,
  channels: number,
  dtype: Uint8ArrayConstructor | Uint16ArrayConstructor | Float32ArrayConstructor
) {
  checkPositiveInt(fs)
  checkPositiveInt(channels)

  const length          = raw.byteLength
  const fileSize        = 36 + length
  const fmtChunkBytes   = 16
  const formatCode      = (dtype === Float32Array) ? 3 : 1
  const bytesPerElement = dtype.BYTES_PER_ELEMENT
  const dataRate        = fs * bytesPerElement * channels
  const blockSize       = bytesPerElement * channels
  const bitDepth        = 8 * bytesPerElement
  const headerSize      = 44
  const header          = new ArrayBuffer(headerSize)
  const view            = new DataView(header)

  const writeStringToView = (offset: number, string: string, view: DataView) => {
    [...string].forEach((char, index) => {
      view.setUint8(offset + index, char.charCodeAt(0))
    })
  }

  writeStringToView(0,  'RIFF',        view)
  view.setUint32(   4,  fileSize,      true)
  writeStringToView(8,  'WAVE',        view)
  writeStringToView(12, 'fmt ',        view)
  view.setUint32(   16, fmtChunkBytes, true)
  view.setUint16(   20, formatCode,    true)
  view.setUint16(   22, channels,      true)
  view.setUint32(   24, fs,            true)
  view.setUint32(   28, dataRate,      true)
  view.setUint16(   32, blockSize,     true)
  view.setUint16(   34, bitDepth,      true)
  writeStringToView(36, 'data',        view)
  view.setUint32(   40, length,        true)

  const wav = dtype.from([
    ...new dtype(header),
    ...raw
  ])

  return wav as T
}

export function interpZeros (data: number[]) {
  const cloned = structuredClone(data)

  const nonZeroIndices = Array.from(data).map((value, index) => {
    if (value !== 0) {
      return index
    } else {
      return null
    }
  }).filter((value) => value !== null) as number[]

  for (let i = 0; i < nonZeroIndices.length; i++) {
    const nonZeroIndex = nonZeroIndices[i]

    if (i === 0) {
      if (nonZeroIndex !== 0) {
        const space = linspace(
          cloned[nonZeroIndex],
          cloned[nonZeroIndex],
          nonZeroIndex
        )
        cloned.splice(0, space.length, ...space)
      }
      continue
    }

    if ((i >= (nonZeroIndices.length - 1)) && (nonZeroIndices.length < data.length)) {
      const space = linspace(
        cloned[nonZeroIndex],
        cloned[nonZeroIndex],
        data.length - nonZeroIndex
      )
      cloned.splice(nonZeroIndex, space.length, ...space)
    }

    const prevNonZeroIndex = nonZeroIndices[i - 1]
    if (prevNonZeroIndex === (nonZeroIndex - 1)) continue

    const prevValue = cloned[prevNonZeroIndex]
    const currentValue = cloned[nonZeroIndex]

    const space = linspace(
      prevValue,
      currentValue,
      nonZeroIndex - (prevNonZeroIndex + 1)
    )
    cloned.splice(prevNonZeroIndex + 1, space.length, ...space)
  }

  return cloned
}

export function linspace (begin: number, end: number, num: number) {
  checkPositiveInt(num)

  if (num === 1) {
    return [(begin + end) / 2]
  }

  const linspace = [...new Array(num)].map((_, index) => {
    return begin + ((end - begin) * (index / (num - 1)))
  })

  return linspace
}

export function interp (x: number[], y: number[], z: number[]) {
  if (x.length !== y.length) {
    throw new Error('number of elements in "x" and "y" do not match')
  }

  const length = x.length
  const lastIndex = length - 1
  const num = z.length
  const interpolated: number[] = [...new Array(num)].fill(0)

  for (let i = 0; i < num; i++) {
    let x0: number | null = null
    let y0: number | null = null
    let x1: number | null = null
    let y1: number | null = null

    for (let j = 0; j < length; j++) {
      if ((z[i] >= x[j]) && (j < lastIndex) && (z[i] < x[j + 1])) {
        x0 = x[j]
        y0 = y[j]
        x1 = x[j + 1]
        y1 = y[j + 1]
        break
      }

      if ((j === lastIndex) && (z[i] === x[j])) {
        interpolated[i] = y[j]
        break
      }
    }

    if ((x0 !== null) && (y0 !== null) && (x1 !== null) && (y1 !== null)) {
      interpolated[i] = (y0 + (y1 - y0) * (z[i] - x0) / (x1 - x0))
    }
  }

  return interpolated
}

export function resample (data: number[], num: number) {
  checkNonNegativeInt(num)

  if (num === 0) {
    return [] as number[]
  }

  const x = linspace(0, 1, data.length)
  const y = data
  const z = linspace(0, 1, num)

  return interp(x, y, z)
}

export function sum (x: number[]) {
  return x.reduce((sum, y) => sum + y, 0)
}

export function avg (x: number[]) {
  return sum(x) / x.length
}
