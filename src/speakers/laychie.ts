import { int } from '../utils'
import type { SpeakerVoice } from '../schemata'

const fs = 24000

export const laychieVoice: Readonly<SpeakerVoice> = {
  fs:       fs,
  segLen:   int(fs * 0.04),
  hopLen:   int(fs * 0.04 / 2),
  baseFreq: 400,
  envelopes: {
    a: [[0,0],[400,0.69],[800,0.81],[1200,1],[1600,0.88],[2000,0.31],[2400,0.2],[2800,0.15],[3200,0.13],[3600,0.17],[4000,0.24],[4800,0.33],[5200,0.34],[5600,0.33],[6400,0.27],[7200,0.17],[8000,0.1],[8800,0.08],[9600,0.08],[10500,0.07],[11300,0.04],[12000,0]],
    i: [[0,0],[400,1],[800,0.56],[1600,0.18],[2000,0.12],[2400,0.09],[2800,0.1],[3200,0.18],[3600,0.56],[4000,0.38],[4400,0.41],[4800,0.41],[5200,0.4],[6000,0.35],[6900,0.25],[7600,0.14],[8000,0.22],[8400,0.1],[9000,0.07],[9600,0.07],[10200,0.09],[11000,0.08],[12000,0]],
    u: [[0,0],[400,1],[1200,0.44],[1600,0.31],[2000,0.43],[2400,0.18],[2800,0.09],[3200,0.05],[3600,0.05],[4000,0.09],[4800,0.28],[5200,0.36],[5600,0.41],[6000,0.42],[6400,0.41],[6800,0.36],[7600,0.15],[8000,0.28],[8400,0.09],[8800,0.2],[9200,0.07],[9600,0.06],[10000,0.08],[10500,0.1],[11200,0.08],[12000,0]],
    e: [[0,0],[400,0.89],[800,1],[1200,0.32],[1600,0.19],[2000,0.13],[2400,0.13],[2800,0.22],[3200,0.51],[3600,0.33],[4000,0.35],[4400,0.34],[4800,0.3],[5600,0.18],[6000,0.24],[6400,0.27],[6800,0.27],[7600,0.11],[8000,0.3],[8400,0.1],[9600,0.06],[10100,0.09],[10900,0.09],[12000,0]],
    o: [[0,0],[400,0.87],[800,1],[1200,0.75],[1600,0.38],[2000,0.19],[2400,0.07],[2800,0.04],[3200,0.03],[3600,0.05],[4000,0.09],[4400,0.15],[4800,0.18],[5200,0.44],[5600,0.33],[6000,0.31],[6900,0.21],[7600,0.1],[8000,0.25],[8400,0.15],[8800,0.09],[9600,0.06],[10000,0.07],[10600,0.1],[11300,0.08],[12000,0]],
    k: [[0,0],[800,0.18],[1600,0.25],[2000,0.44],[2400,1],[2800,0.37],[3200,0.16],[3600,0.08],[4000,0.06],[4400,0.08],[5200,0.09],[6000,0.22],[6400,0.36],[6800,0.22],[7300,0.13],[7800,0.2],[8400,0.5],[9000,0.19],[9800,0.09],[10800,0.04],[12000,0]],
    s: [[0,0],[400,0.02],[1300,0.2],[1800,0.12],[2600,0.22],[3600,0.13],[4300,0.35],[4800,0.23],[5400,0.55],[5900,0.35],[6400,0.77],[7000,0.49],[7500,0.83],[8000,0.6],[8400,1],[8900,0.63],[9400,0.88],[10000,0.55],[10200,0.62],[10900,0.13],[12000,0]],
    t: [[0,0],[400,0.81],[800,0.53],[1200,1],[1600,0.33],[2000,0.18],[2400,0.5],[2800,0.1],[3200,0.08],[3900,0.15],[4400,0.29],[4800,0.47],[5200,0.29],[5600,0.75],[6000,0.47],[6500,0.32],[7300,0.43],[7700,0.81],[8200,0.57],[9100,0.91],[10000,0.59],[10600,0.92],[11300,0.23],[12000,0]],
    n: [[0,0],[400,1],[800,0.46],[1200,0.16],[1600,0.1],[3000,0.04],[4800,0.03],[6400,0.02],[12000,0]],
    h: [[0,0],[800,0.38],[1200,1],[1600,0.38],[2000,0.3],[2400,0.91],[2800,0.2],[3200,0.11],[4000,0.07],[4400,0.19],[4800,0.08],[5200,0.08],[5600,0.2],[6000,0.1],[6500,0.24],[7100,0.07],[7800,0.17],[8800,0.13],[9300,0.03],[10400,0.07],[11000,0.02],[12000,0]],
    m: [[0,0],[200,0.39],[400,1],[600,0.32],[1100,0.23],[1600,0.09],[3200,0.04],[5300,0.02],[12000,0]],
    y: [[0,0],[400,1],[800,0.53],[1200,0.34],[2000,0.09],[2400,0.12],[2800,0.24],[3200,0.48],[4000,0.27],[4400,0.45],[5200,0.13],[5600,0.25],[6000,0.08],[6400,0.05],[12000,0]],
    r: [[0,0],[400,1],[1600,0.17],[2000,0.14],[2400,0.32],[2800,0.13],[3200,0.07],[3600,0.08],[4000,0.13],[4400,0.29],[5200,0.17],[7100,0.08],[8300,0.12],[9200,0.07],[12000,0]],
    w: [[0,0],[400,1],[1200,0.32],[1600,0.22],[2000,0.22],[2400,0.33],[3200,0.09],[4000,0.11],[4400,0.19],[5200,0.63],[6000,0.18],[7300,0.08],[9000,0.04],[12000,0]],
    g: [[0,0],[400,0.72],[800,0.63],[1200,0.57],[1600,0.6],[2000,0.72],[2400,1],[2800,0.26],[3200,0.16],[3600,0.1],[4400,0.05],[5200,0.06],[5700,0.1],[6400,0.21],[6900,0.11],[7600,0.1],[8600,0.26],[9100,0.13],[9800,0.16],[10600,0.04],[12000,0]],
    z: [[0,0],[400,0.34],[900,0.22],[1600,0.16],[2200,0.34],[2800,0.15],[3700,0.09],[4200,0.25],[4700,0.12],[5600,0.28],[6000,0.14],[6400,0.42],[7000,0.18],[7500,0.56],[7700,0.46],[8300,1],[8800,0.67],[9600,0.94],[10000,0.61],[10300,0.74],[10700,0.18],[11300,0.05],[12000,0]],
    d: [[0,0],[400,0.78],[600,0.31],[900,0.23],[1200,0.42],[1600,0.16],[2400,0.16],[2800,0.19],[3200,0.31],[3600,0.15],[4000,0.26],[4400,0.44],[4800,0.31],[5200,0.25],[6000,0.41],[6400,0.63],[6700,0.32],[7500,0.6],[8300,1],[8800,0.69],[9200,0.76],[9600,0.47],[9900,0.56],[10300,0.3],[10900,0.1],[12000,0]],
    b: [[0,0],[400,1],[1700,0.36],[2300,0.19],[2700,0.11],[3600,0.03],[5200,0.04],[6500,0.09],[7600,0.24],[8800,0.12],[10000,0.06],[12000,0]],
    p: [[0,0],[400,1],[800,0.59],[1200,0.62],[1600,0.31],[2000,0.33],[2800,0.17],[3600,0.09],[5200,0.3],[5600,0.3],[6000,0.26],[6400,0.29],[7200,0.18],[8500,0.08],[9800,0.03],[12000,0]],
    v: [[0,0],[400,1],[1700,0.36],[2300,0.19],[2700,0.11],[3600,0.03],[12000,0]],
    q: [[0,0],[12000,0]]
  },
  kanas: {
    'あ': [
      { envKey: 'a', len: null }
    ],
    'い': [
      { envKey: 'i', len: null }
    ],
    'う': [
      { envKey: 'u', len: null }
    ],
    'え': [
      { envKey: 'e', len: null }
    ],
    'お': [
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'か': [
      { envKey: 'k', len: 0.05 },
      { envKey: 'a', len: null }
    ],
    'き': [
      { envKey: 'k', len: 0.08 },
      { envKey: 'i', len: null }
    ],
    'く': [
      { envKey: 'k', len: 0.08 },
      { envKey: 'u', len: null }
    ],
    'け': [
      { envKey: 'k', len: 0.08 },
      { envKey: 'e', len: null }
    ],
    'こ': [
      { envKey: 'k', len: 0.05 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'さ': [
      { envKey: 's', len: 0.08 },
      { envKey: 'a', len: null }
    ],
    'し': [
      { envKey: 's', len: 0.08 },
      { envKey: 'i', len: null }
    ],
    'す': [
      { envKey: 's', len: 0.08 },
      { envKey: 'u', len: null }
    ],
    'せ': [
      { envKey: 's', len: 0.08 },
      { envKey: 'e', len: null }
    ],
    'そ': [
      { envKey: 's', len: 0.08 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'た': [
      { envKey: 't', len: 0.02 },
      { envKey: 'a', len: null }
    ],
    'ち': [
      { envKey: 't', len: 0.08 },
      { envKey: 'i', len: null }
    ],
    'つ': [
      { envKey: 't', len: 0.08 },
      { envKey: 'u', len: null }
    ],
    'て': [
      { envKey: 't', len: 0.02 },
      { envKey: 'e', len: null }
    ],
    'と': [
      { envKey: 't', len: 0.02 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'な': [
      { envKey: 'n', len: 0.08 },
      { envKey: 'a', len: null }
    ],
    'に': [
      { envKey: 'n', len: 0.08 },
      { envKey: 'i', len: null }
    ],
    'ぬ': [
      { envKey: 'n', len: 0.08 },
      { envKey: 'u', len: null }
    ],
    'ね': [
      { envKey: 'n', len: 0.08 },
      { envKey: 'e', len: null }
    ],
    'の': [
      { envKey: 'n', len: 0.08 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'は': [
      { envKey: 'h', len: 0.08 },
      { envKey: 'a', len: null }
    ],
    'ひ': [
      { envKey: 'h', len: 0.08 },
      { envKey: 'i', len: null }
    ],
    'ふ': [
      { envKey: 'h', len: 0.08 },
      { envKey: 'u', len: null }
    ],
    'へ': [
      { envKey: 'h', len: 0.08 },
      { envKey: 'e', len: null }
    ],
    'ほ': [
      { envKey: 'h', len: 0.08 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ま': [
      { envKey: 'm', len: 0.06 },
      { envKey: 'a', len: null }
    ],
    'み': [
      { envKey: 'm', len: 0.06 },
      { envKey: 'i', len: null }
    ],
    'む': [
      { envKey: 'm', len: 0.06 },
      { envKey: 'u', len: null }
    ],
    'め': [
      { envKey: 'm', len: 0.06 },
      { envKey: 'e', len: null }
    ],
    'も': [
      { envKey: 'm', len: 0.06 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'や': [
      { envKey: 'y', len: 0.06 },
      { envKey: 'a', len: null }
    ],
    'ゆ': [
      { envKey: 'y', len: 0.06 },
      { envKey: 'u', len: null }
    ],
    'よ': [
      { envKey: 'y', len: 0.06 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ら': [
      { envKey: 'r', len: 0.08 },
      { envKey: 'a', len: null }
    ],
    'り': [
      { envKey: 'r', len: 0.08 },
      { envKey: 'i', len: null }
    ],
    'る': [
      { envKey: 'r', len: 0.08 },
      { envKey: 'u', len: null }
    ],
    'れ': [
      { envKey: 'r', len: 0.08 },
      { envKey: 'e', len: null }
    ],
    'ろ': [
      { envKey: 'r', len: 0.08 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'わ': [
      { envKey: 'w', len: 0.07 },
      { envKey: 'a', len: null }
    ],
    'うぃ': [
      { envKey: 'w', len: 0.07 },
      { envKey: 'i', len: null }
    ],
    'うぇ': [
      { envKey: 'w', len: 0.07 },
      { envKey: 'e', len: null }
    ],
    'うぉ': [
      { envKey: 'w', len: 0.07 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ん': [
      { envKey: 'n', len: null }
    ],

    /* ================ */

    'が': [
      { envKey: 'g', len: 0.05 },
      { envKey: 'a', len: null }
    ],
    'ぎ': [
      { envKey: 'g', len: 0.08 },
      { envKey: 'i', len: null }
    ],
    'ぐ': [
      { envKey: 'g', len: 0.08 },
      { envKey: 'u', len: null }
    ],
    'げ': [
      { envKey: 'g', len: 0.08 },
      { envKey: 'e', len: null }
    ],
    'ご': [
      { envKey: 'g', len: 0.05 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ざ': [
      { envKey: 'z', len: 0.08 },
      { envKey: 'a', len: null }
    ],
    'じ': [
      { envKey: 'z', len: 0.08 },
      { envKey: 'i', len: null }
    ],
    'ず': [
      { envKey: 'z', len: 0.08 },
      { envKey: 'u', len: null }
    ],
    'ぜ': [
      { envKey: 'z', len: 0.08 },
      { envKey: 'e', len: null }
    ],
    'ぞ': [
      { envKey: 'z', len: 0.08 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'だ': [
      { envKey: 'd', len: 0.02 },
      { envKey: 'a', len: null }
    ],
    'でぃ': [
      { envKey: 'd', len: 0.08 },
      { envKey: 'i', len: null }
    ],
    'どぅ': [
      { envKey: 'd', len: 0.08 },
      { envKey: 'u', len: null }
    ],
    'で': [
      { envKey: 'd', len: 0.02 },
      { envKey: 'e', len: null }
    ],
    'ど': [
      { envKey: 'd', len: 0.02 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ば': [
      { envKey: 'b', len: 0.08 },
      { envKey: 'a', len: null }
    ],
    'び': [
      { envKey: 'b', len: 0.08 },
      { envKey: 'i', len: null }
    ],
    'ぶ': [
      { envKey: 'b', len: 0.08 },
      { envKey: 'u', len: null }
    ],
    'べ': [
      { envKey: 'b', len: 0.08 },
      { envKey: 'e', len: null }
    ],
    'ぼ': [
      { envKey: 'b', len: 0.08 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ぱ': [
      { envKey: 'p', len: 0.02 },
      { envKey: 'a', len: null }
    ],
    'ぴ': [
      { envKey: 'p', len: 0.02 },
      { envKey: 'i', len: null }
    ],
    'ぷ': [
      { envKey: 'p', len: 0.02 },
      { envKey: 'u', len: null }
    ],
    'ぺ': [
      { envKey: 'p', len: 0.02 },
      { envKey: 'e', len: null }
    ],
    'ぽ': [
      { envKey: 'p', len: 0.02 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ゔぁ': [
      { envKey: 'v', len: 0.06 },
      { envKey: 'a', len: null }
    ],
    'ゔぃ': [
      { envKey: 'v', len: 0.06 },
      { envKey: 'i', len: null }
    ],
    'ゔ': [
      { envKey: 'v', len: 0.06 },
      { envKey: 'u', len: null }
    ],
    'ゔぇ': [
      { envKey: 'v', len: 0.06 },
      { envKey: 'e', len: null }
    ],
    'ゔぉ': [
      { envKey: 'v', len: 0.06 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'きゃ': [
      { envKey: 'k', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'きゅ': [
      { envKey: 'k', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'きぇ': [
      { envKey: 'k', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'きょ': [
      { envKey: 'k', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'しゃ': [
      { envKey: 's', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'すぃ': [
      { envKey: 's', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'i', len: null }
    ],
    'しゅ': [
      { envKey: 's', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'しぇ': [
      { envKey: 's', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'しょ': [
      { envKey: 's', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ちゃ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'ちゅ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'ちぇ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'ちょ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'つぁ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'u', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'つぃ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'u', len: 0.04 },
      { envKey: 'i', len: null }
    ],
    'とぅ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'u', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'つぇ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'u', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'つぉ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'u', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'てゃ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'e', len: 0.05 },
      { envKey: 'y', len: 0.03 },
      { envKey: 'a', len: null }
    ],
    'てぃ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'e', len: 0.05 },
      { envKey: 'y', len: 0.03 },
      { envKey: 'i', len: null }
    ],
    'てゅ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'e', len: 0.05 },
      { envKey: 'y', len: 0.03 },
      { envKey: 'u', len: null }
    ],
    'てょ': [
      { envKey: 't', len: 0.06 },
      { envKey: 'e', len: 0.05 },
      { envKey: 'y', len: 0.03 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'にゃ': [
      { envKey: 'n', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'にゅ': [
      { envKey: 'n', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'にぇ': [
      { envKey: 'n', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'にょ': [
      { envKey: 'n', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ひゃ': [
      { envKey: 'h', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'ひゅ': [
      { envKey: 'h', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'ひぇ': [
      { envKey: 'h', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'ひょ': [
      { envKey: 'h', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'みゃ': [
      { envKey: 'm', len: 0.04 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'みゅ': [
      { envKey: 'm', len: 0.04 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'みぇ': [
      { envKey: 'm', len: 0.04 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'みょ': [
      { envKey: 'm', len: 0.04 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'りゃ': [
      { envKey: 'r', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'りゅ': [
      { envKey: 'r', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'りぇ': [
      { envKey: 'r', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'りょ': [
      { envKey: 'r', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ぎゃ': [
      { envKey: 'g', len: 0.05 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'ぎゅ': [
      { envKey: 'g', len: 0.05 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'ぎぇ': [
      { envKey: 'g', len: 0.05 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'ぎょ': [
      { envKey: 'g', len: 0.05 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'じゃ': [
      { envKey: 'z', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'ずぃ': [
      { envKey: 'z', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'i', len: null }
    ],
    'じゅ': [
      { envKey: 'z', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'じぇ': [
      { envKey: 'z', len: 0.06 },
      { envKey: 'i', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'じょ': [
      { envKey: 'z', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'でゃ': [
      { envKey: 'd', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'でゅ': [
      { envKey: 'd', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'でょ': [
      { envKey: 'd', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'びゃ': [
      { envKey: 'b', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'びゅ': [
      { envKey: 'b', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'びぇ': [
      { envKey: 'b', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'びょ': [
      { envKey: 'b', len: 0.06 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ぴゃ': [
      { envKey: 'p', len: 0.02 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'ぴゅ': [
      { envKey: 'p', len: 0.02 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'u', len: null }
    ],
    'ぴぇ': [
      { envKey: 'p', len: 0.02 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'ぴょ': [
      { envKey: 'p', len: 0.02 },
      { envKey: 'y', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'ふぁ': [
      { envKey: 'h', len: 0.06 },
      { envKey: 'u', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'ふぃ': [
      { envKey: 'h', len: 0.06 },
      { envKey: 'u', len: 0.04 },
      { envKey: 'i', len: null }
    ],
    'ふぇ': [
      { envKey: 'h', len: 0.06 },
      { envKey: 'u', len: 0.04 },
      { envKey: 'e', len: null }
    ],
    'ふぉ': [
      { envKey: 'h', len: 0.06 },
      { envKey: 'u', len: 0.04 },
      { envKey: 'o', len: null }
    ],

    /* ================ */

    'いぇ': [
      { envKey: 'i', len: 0.08 },
      { envKey: 'e', len: null }
    ],

    /* ================ */

    'くゎ': [
      { envKey: 'k', len: 0.06 },
      { envKey: 'w', len: 0.04 },
      { envKey: 'a', len: null }
    ],
    'ぐゎ': [
      { envKey: 'g', len: 0.06 },
      { envKey: 'w', len: 0.04 },
      { envKey: 'a', len: null }
    ],

    /* ================ */

    'っ': [
      { envKey: 'q', len: null }
    ],
    '、': [
      { envKey: 'q', len: null }
    ]
  }
}
