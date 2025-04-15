/**
 * CitySim - ゲームデータと設定
 * 都市シミュレーションゲームのバランス調整やデータ定義
 */

// ゲーム内テキストやメッセージ
const GAME_TEXT = {
    // チュートリアルメッセージ
    tutorial: {
        welcome: {
            title: "CitySim へようこそ！",
            message: "このゲームでは、あなたは新しい都市の市長として都市を発展させていきます。シンプルなルールで奥深い戦略が楽しめます。"
        },
        buildings: {
            title: "インフラ建設",
            message: "都市の成長には様々な建物が必要です。住宅は人口を増やし、工場は収入を生み出し、道路は移動をスムーズにします。"
        },
        economy: {
            title: "経済管理",
            message: "資金は慎重に使いましょう。税率を設定して収入を確保し、戦略的に建物を建設して都市の発展を促進しましょう。"
        },
        events: {
            title: "ランダムイベント",
            message: "予期せぬ出来事が発生することがあります。自然災害や経済変動など、様々なイベントに上手く対応しましょう。"
        },
        metrics: {
            title: "都市指標",
            message: "幸福度、環境、教育などの指標を監視して、バランスの取れた都市開発を心がけましょう。"
        }
    },

    // ヒントメッセージ
    tips: [
        "税率を低くすると人口が増えやすくなります",
        "環境が悪化すると幸福度が下がります",
        "定期的に道路を建設すると都市の効率が上がります",
        "工場は収入源ですが、環境に悪影響を与えます",
        "住宅を増やすことで人口と税収を増やせます",
        "資金は常に余裕を持っておきましょう。予期せぬイベントで使うことがあります",
        "幸福度が高いと人口増加率が上がります",
        "スペースキーでゲームの一時停止/再開ができます",
        "数字キー1-7でアクションをショートカット操作できます",
        "教育への投資は長期的な発展につながります"
    ],

    // イベント効果のメッセージテンプレート
    eventEffects: {
        populationGain: "人口が<strong>{amount}人</strong>増加しました",
        populationLoss: "人口が<strong>{amount}人</strong>減少しました",
        fundsGain: "<strong>¥{amount}</strong>の資金を獲得しました",
        fundsLoss: "<strong>¥{amount}</strong>の資金を失いました",
        happinessGain: "幸福度が<strong>{amount}%</strong>上昇しました",
        happinessLoss: "幸福度が<strong>{amount}%</strong>低下しました",
        environmentGain: "環境が<strong>{amount}%</strong>改善しました",
        environmentLoss: "環境が<strong>{amount}%</strong>悪化しました",
        educationGain: "教育水準が<strong>{amount}%</strong>向上しました",
        educationLoss: "教育水準が<strong>{amount}%</strong>低下しました"
    }
};

// ランダムイベントのバリエーションを増やしたデータ
const EXTENDED_EVENTS = [
    // 自然災害
    {
        title: '地震発生！',
        message: '市内で地震が発生しました。被害の修復が必要です。',
        type: 'event-danger',
        icon: 'globe-asia',
        probability: 0.03,
        conditions: {},
        effects: {
            population: -15,
            funds: -200,
            happiness: -10,
            houses: -1
        }
    },
    {
        title: '洪水発生！',
        message: '豪雨による洪水が市内の一部地域を襲いました。',
        type: 'event-danger',
        icon: 'water',
        probability: 0.04,
        conditions: {},
        effects: {
            funds: -150,
            happiness: -8,
            environment: -5
        }
    },
    {
        title: '猛暑到来',
        message: '記録的な猛暑が市民の健康に影響を与えています。',
        type: 'event-warning',
        icon: 'temperature-high',
        probability: 0.05,
        conditions: {},
        effects: {
            happiness: -5,
            funds: -50
        }
    },
    
    // 経済イベント
    {
        title: '観光ブーム！',
        message: '多くの観光客が訪れ、地域経済が活性化しています。',
        type: 'event-success',
        icon: 'plane-arrival',
        probability: 0.06,
        conditions: {
            houses: 5,
            roads: 3
        },
        effects: {
            funds: 300,
            happiness: 5
        }
    },
    {
        title: '投資家の関心',
        message: '外部の投資家たちがあなたの都市に興味を示しています。',
        type: 'event-success',
        icon: 'hand-holding-usd',
        probability: 0.05,
        conditions: {
            factories: 2
        },
        effects: {
            funds: 400,
            factories: 1
        }
    },
    
    // 社会イベント
    {
        title: '文化フェスティバル',
        message: '市民主導の文化イベントが盛大に開催されました。',
        type: 'event-success',
        icon: 'music',
        probability: 0.07,
        conditions: {
            population: 50
        },
        effects: {
            happiness: 8,
            funds: 100
        }
    },
    {
        title: '市民ボランティア活動',
        message: '市民たちが環境美化に取り組んでいます。',
        type: 'event-success',
        icon: 'hands-helping',
        probability: 0.08,
        conditions: {},
        effects: {
            environment: 5,
            happiness: 3
        }
    },
    
    // 環境イベント
    {
        title: '環境保護運動',
        message: '環境保護団体が活動を始め、環境意識が高まっています。',
        type: 'event-info',
        icon: 'leaf',
        probability: 0.06,
        conditions: {
            environment: {min: 0, max: 50}
        },
        effects: {
            environment: 7,
            happiness: 2
        }
    },
    {
        title: '深刻な大気汚染',
        message: '工場からの排出ガスによる大気汚染が深刻化しています。',
        type: 'event-warning',
        icon: 'smog',
        probability: 0.06,
        conditions: {
            factories: 3,
            environment: {min: 0, max: 60}
        },
        effects: {
            environment: -10,
            happiness: -5,
            population: -5
        }
    }
];

// 建物効果の詳細データ
const BUILDING_EFFECTS = {
    house: {
        name: "住宅",
        icon: "home",
        cost: 100,
        effects: {
            population: 10,
            happiness: 1,
            environment: -2
        },
        description: "住民が住む基本的な建物。人口と幸福度を増加させますが、環境への小さな影響があります。"
    },
    factory: {
        name: "工場",
        icon: "industry",
        cost: 200,
        effects: {
            funds: 50,
            population: 5,
            environment: -5,
            happiness: -2
        },
        description: "雇用と収入を生み出す産業施設。環境と幸福度に影響します。"
    },
    road: {
        name: "道路",
        icon: "road",
        cost: 50,
        effects: {
            happiness: 3,
            environment: -1
        },
        description: "都市の交通を改善し、市民の移動をスムーズにします。幸福度を向上させますが、環境への軽微な影響があります。"
    },
    school: {
        name: "学校",
        icon: "graduation-cap",
        cost: 300,
        effects: {
            education: 15,
            happiness: 5
        },
        description: "教育水準を向上させ、市民の幸福度も増加させます。将来的な都市発展に重要です。"
    },
    park: {
        name: "公園",
        icon: "tree",
        cost: 150,
        effects: {
            environment: 10,
            happiness: 8
        },
        description: "緑豊かな公共空間。環境と幸福度を大きく向上させます。"
    },
    hospital: {
        name: "病院",
        icon: "hospital",
        cost: 350,
        effects: {
            happiness: 10,
            population: 8
        },
        description: "市民の健康を守り、幸福度を上げます。人口の増加にも貢献します。"
    }
};
