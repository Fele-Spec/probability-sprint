/* ============================================================
   知识点数据：浙大《概率论与数理统计》第五版 第一~三章
   每节：卡片（主动回忆）／公式／易错点／典型例题
   卡片是“问题在前、答案在后”，用于提取练习。
   ============================================================ */
window.KNOWLEDGE = {
  meta: {
    textbook: '《概率论与数理统计》第五版（浙江大学 盛骤、谢式千、潘承毅）',
    note: '覆盖第一章至第三章，共 16 个小节。'
  },
  chapters: [
    {
      id: 1,
      emoji: '🎲',
      title: '概率论的基本概念',
      subtitle: '样本空间 · 事件运算 · 概率公理 · 古典概型 · 条件概率 · 独立性',
      sections: [
        {
          id: '1-1',
          num: '§1',
          title: '随机试验与样本空间',
          minutes: 8,
          intro: '概率论的第一步，是把“随机现象”翻译成集合语言：所有可能结果组成样本空间，我们关心的事件就是其中的子集。',
          cards: [
            {
              q: '一个试验要成为“随机试验”，通常要满足哪三个特征？',
              a: '① 可以在相同条件下重复进行；② 每次试验的可能结果不止一个，而事先能明确所有可能结果；③ 每次试验前不能确定哪一个结果会出现。',
              tip: '口诀：可重复、知全部、难预知。'
            },
            {
              q: '样本空间、样本点分别是什么？',
              a: '随机试验 E 的所有可能结果组成的集合叫样本空间 S；S 的每个元素（每个可能结果）叫样本点 e。例如掷一枚骰子：<span class="m">S = {1,2,3,4,5,6}</span>。'
            },
            {
              q: '随机事件、基本事件、必然事件与不可能事件分别怎么定义？',
              a: '样本空间的子集叫随机事件（简称事件）；只含一个样本点的事件叫基本事件；S 本身是必然事件；空集 ∅ 是不可能事件。'
            },
            {
              q: '“事件 A 发生”用样本点怎么表述？',
              a: '试验的结果 e 属于 A，即 <span class="m">e ∈ A</span>。概率论里的事件运算，本质上就是集合运算。'
            },
            {
              q: '掷两枚硬币，样本空间怎么写？“恰好一枚正面”怎么表示？',
              a: '把两枚硬币区分先后：<span class="m">S = {HH, HT, TH, TT}</span>；“恰好一枚正面” = <span class="m">{HT, TH}</span>。',
              tip: '用有序样本空间，四个结果才等可能——这是古典概率的地基。'
            }
          ],
          formulas: [
            { label: '样本空间与样本点', html: '<span class="m">e ∈ S</span>' },
            { label: '事件与发生', html: '<span class="m">A ⊆ S；A 发生 ⇔ e ∈ A</span>' }
          ],
          pitfalls: [
            '样本空间必须“不重不漏”，否则古典概率的分母就错了。',
            '把 {两正, 一正一反, 两反} 当成等可能的三种结果：它们不是等可能的，不能直接数。',
            '“至少 / 至多”这类事件容易漏情况，画树状图或列表更稳。'
          ],
          example: {
            title: '掷两枚均匀骰子，数一数“点数之和为 7”',
            problem: '掷两枚均匀骰子，求事件“点数之和为 7”包含多少个样本点。',
            steps: [
              '把第一枚点数记为 x、第二枚记为 y，样本点是 (x,y)，共 36 个等可能结果。',
              '满足 x+y=7 的有 (1,6),(2,5),(3,4),(4,3),(5,2),(6,1)。',
              '共 6 个样本点，所以 P(和为 7)=6/36=1/6。'
            ],
            answer: '6 个样本点（概率 1/6）'
          }
        },
        {
          id: '1-2',
          num: '§2',
          title: '样本空间、随机事件的关系与运算',
          minutes: 10,
          intro: '事件就是集合：并、交、差、补分别对应“至少一个发生”“同时发生”“发生但不发生”“不发生”。把事件当集合玩熟，后面的公式才顺手。',
          cards: [
            {
              q: '包含、相等、互斥、对立分别怎么定义？',
              a: '<span class="m">A⊂B</span>：A 发生必导致 B 发生；<span class="m">A=B</span>：互相包含；<span class="m">AB=∅</span>：A 与 B 不能同时发生（互斥）；A 与 B 对立：<span class="m">A∪B=S</span> 且 <span class="m">AB=∅</span>，记 <span class="m">B=Ā</span>。',
              tip: '对立 = 互斥 + 覆盖全部；互斥不一定对立。'
            },
            {
              q: '和事件、积事件、差事件分别表示什么？',
              a: '<span class="m">A∪B</span>：A、B 至少一个发生；<span class="m">AB</span>（=A∩B）：A、B 同时发生；<span class="m">A−B=A B̄</span>：A 发生而 B 不发生。'
            },
            {
              q: '德摩根律怎么写？',
              a: '<span class="m">(A∪B)‾ = Ā B̄</span>；<span class="m">(AB)‾ = Ā ∪ B̄</span>。口诀：横线进括号，并交互换。',
              tip: '求“至少一个不发生”时特别好用。'
            },
            {
              q: '什么是完备事件组（样本空间的一个划分）？',
              a: '事件 <span class="m">B₁,…,Bₙ</span> 两两互斥，且 <span class="m">B₁∪…∪Bₙ=S</span>，则称它们构成完备事件组。全概率公式和贝叶斯公式都要求它。'
            },
            {
              q: '“至少有一个发生”与“恰好一个发生”分别怎么用事件表示？',
              a: '至少一个：<span class="m">A∪B</span>；恰好一个：<span class="m">(A B̄)∪(Ā B)</span>。注意“恰好”要排除同时发生。'
            }
          ],
          formulas: [
            { label: '差事件', html: '<span class="m">A−B = A B̄</span>' },
            { label: '德摩根律', html: '<span class="m">(A∪B)‾ = Ā B̄，&nbsp; (AB)‾ = Ā ∪ B̄</span>' },
            { label: '加法公式', html: '<span class="m">P(A∪B) = P(A) + P(B) − P(AB)</span>' }
          ],
          pitfalls: [
            '<span class="m">A−B</span> 不是“A 与 B 互斥”，它表示 A 发生且 B 不发生。',
            '德摩根律方向容易写反：并的补是补的交。',
            '“至少”类问题优先考虑对立事件 <span class="m">1−P(一个都没有)</span>。'
          ],
          example: {
            title: '用加法公式拆事件',
            problem: '已知 P(A)=0.4，P(B)=0.3，P(A∪B)=0.6，求 P(AB)、P(A B̄)、P(Ā B̄)。',
            steps: [
              '由加法公式：P(AB)=P(A)+P(B)−P(A∪B)=0.4+0.3−0.6=0.1。',
              'P(A B̄)=P(A)−P(AB)=0.4−0.1=0.3。',
              'P(Ā B̄)=P((A∪B)‾)=1−P(A∪B)=0.4。'
            ],
            answer: 'P(AB)=0.1，P(A B̄)=0.3，P(Ā B̄)=0.4'
          }
        },
        {
          id: '1-3',
          num: '§3',
          title: '频率与概率',
          minutes: 10,
          intro: '频率是“数出来的”，概率是“公理定义的”。频率稳定于概率，这是用频率估计概率的依据，也是大数定律的雏形。',
          cards: [
            {
              q: '频率怎么定义？它和概率是什么关系？',
              a: '在 n 次试验中事件 A 发生 <span class="m">n_A</span> 次，频率 <span class="m">f_n(A)=n_A/n</span>。n 增大时频率会稳定在某个常数附近，这个稳定值就是概率（统计定义）。'
            },
            {
              q: '概率的公理化定义有哪三条？',
              a: '设 P 是定义在事件上的函数：① 非负性 <span class="m">P(A)≥0</span>；② 规范性 <span class="m">P(S)=1</span>；③ 可列可加性：若事件列两两互斥，则 <span class="m">P(∪Aᵢ)=ΣP(Aᵢ)</span>。'
            },
            {
              q: '由公理推出的常用性质有哪些？',
              a: '<span class="m">P(∅)=0</span>；有限可加性；<span class="m">P(Ā)=1−P(A)</span>；<span class="m">P(A−B)=P(A)−P(AB)</span>；若 <span class="m">A⊂B</span>，则 <span class="m">P(B−A)=P(B)−P(A)</span> 且 <span class="m">P(A)≤P(B)</span>；加法公式 <span class="m">P(A∪B)=P(A)+P(B)−P(AB)</span>。'
            },
            {
              q: '三个事件的加法公式是什么？',
              a: '<span class="m">P(A∪B∪C)=P(A)+P(B)+P(C)−P(AB)−P(AC)−P(BC)+P(ABC)</span>。',
              tip: '容斥原理：加单、减双、加三。'
            },
            {
              q: '概率为 0 的事件一定是不可能事件吗？概率为 1 一定是必然事件吗？',
              a: '不一定。连续型随机变量取任一点的概率为 0，但该点并非不可能；概率为 1 的事件也可能“漏掉”零概率点。',
              tip: '这是后面连续型分布的关键直觉：概率 0 ≠ 不可能。'
            }
          ],
          formulas: [
            { label: '对立事件', html: '<span class="m">P(Ā) = 1 − P(A)</span>' },
            { label: '加法公式', html: '<span class="m">P(A∪B) = P(A) + P(B) − P(AB)</span>' },
            { label: '三事件容斥', html: '<span class="m">P(A∪B∪C) = ΣP(A) − ΣP(AB) + P(ABC)</span>' }
          ],
          pitfalls: [
            '把“概率为 0”直接等同于“不可能”（连续型反例）。',
            '加法公式忘记减交集，导致 P(A∪B) 超过 1。',
            '频率不是概率，只是估计；试验次数少时波动很大。'
          ],
          example: {
            title: '三事件容斥',
            problem: '设 P(A)=P(B)=P(C)=1/4，P(AB)=0，P(AC)=P(BC)=1/8，P(ABC)=0，求 P(A∪B∪C)。',
            steps: [
              '使用三事件容斥公式。',
              'P(A∪B∪C)=3×(1/4) − (0+1/8+1/8) + 0',
              '= 3/4 − 1/4 = 1/2。'
            ],
            answer: '1/2'
          }
        },
        {
          id: '1-4',
          num: '§4',
          title: '等可能概型（古典概型）',
          minutes: 14,
          intro: '古典概型是最“好数”的概率模型：样本空间有限且每个基本事件等可能，概率 = 有利样本点数 / 总样本点数。难点不在公式，在计数。',
          cards: [
            {
              q: '古典概型需要满足哪两个条件？概率怎么算？',
              a: '① 样本空间只含有限个样本点；② 每个基本事件发生的可能性相同。此时 <span class="m">P(A)=k/n</span>，k 为 A 包含的样本点数，n 为样本点总数。'
            },
            {
              q: '排列与组合的核心公式是什么？',
              a: '从 n 个不同元素中取 k 个：排列 <span class="m">P(n,k)=n!/(n−k)!</span>（讲顺序）；组合 <span class="m">C(n,k)=n!/(k!(n−k)!)</span>（不讲顺序）。分类用加法原理，分步用乘法原理。'
            },
            {
              q: '抽样时“有放回 / 无放回”“有序 / 无序”会怎么影响分母？',
              a: '只要分子和分母采用同一套计数方式，结果就一样；最容易错的是分母用组合、分子用排列。先定“样本空间怎么数”，再数有利事件。'
            },
            {
              q: '超几何模型解决什么问题？',
              a: '一批 N 件产品中有 M 件次品，不放回取 n 件，其中次品数 X 满足 <span class="m">P(X=k)=C(M,k)C(N−M,n−k)/C(N,n)</span>。',
              tip: '“不放回、两类、抽若干个” → 超几何。'
            },
            {
              q: '“至少一个”为什么要用对立事件？',
              a: '直接数“至少一个”情况多且易重；<span class="m">1−P(一个都没有)</span> 往往只有一种情况，简单可靠。'
            }
          ],
          formulas: [
            { label: '古典概率', html: '<span class="m">P(A) = <span class="frac"><span>k</span><span>n</span></span></span>' },
            { label: '组合数', html: '<span class="m">C(n,k) = <span class="frac"><span>n!</span><span>k!(n−k)!</span></span></span>' },
            { label: '超几何分布', html: '<span class="m">P(X=k) = <span class="frac"><span>C(M,k)C(N−M,n−k)</span><span>C(N,n)</span></span></span>' }
          ],
          pitfalls: [
            '样本空间不等可能却直接数个数（例如 {两正,一正一反,两反}）。',
            '分子分母一个有序、一个无序。',
            '“至少”类问题忘记用补事件，导致漏算。'
          ],
          example: {
            title: '抽球：恰有 2 白 1 黑',
            problem: '袋中有 5 个白球、3 个黑球，任取 3 个，求恰好 2 白 1 黑的概率。',
            steps: [
              '总取法：从 8 个球中取 3 个，C(8,3)=56。',
              '有利取法：先从 5 白中取 2 个 C(5,2)=10，再从 3 黑中取 1 个 C(3,1)=3，共 30。',
              'P=30/56=15/28。'
            ],
            answer: '15/28'
          }
        },
        {
          id: '1-5',
          num: '§5',
          title: '条件概率',
          minutes: 18,
          intro: '条件概率是“已知某信息后重新算概率”：样本空间从 S 缩小到 A。全概率公式“由因推果”，贝叶斯公式“由果推因”，是第一章最常考的一条线。',
          cards: [
            {
              q: '条件概率怎么定义？它还是概率吗？',
              a: '当 <span class="m">P(A)&gt;0</span> 时，<span class="m">P(B|A)=P(AB)/P(A)</span>。固定 A 后，<span class="m">P(·|A)</span> 仍满足概率的三条公理，也是一个概率。'
            },
            {
              q: '乘法公式怎么写？',
              a: '<span class="m">P(AB)=P(A)P(B|A)</span>（P(A)&gt;0）；多个事件时 <span class="m">P(A₁A₂…Aₙ)=P(A₁)P(A₂|A₁)…P(Aₙ|A₁…Aₙ₋₁)</span>。'
            },
            {
              q: '全概率公式的内容和用途？',
              a: '若 <span class="m">B₁,…,Bₙ</span> 是完备事件组，则 <span class="m">P(A)=ΣP(Bᵢ)P(A|Bᵢ)</span>。用途：结果受多种“原因”影响时，按原因分类加权求和。'
            },
            {
              q: '贝叶斯公式怎么写？用途是什么？',
              a: '<span class="m">P(Bᵢ|A)=P(Bᵢ)P(A|Bᵢ)/P(A)</span>，分母用全概率公式展开。用途：已知结果 A 反推“最可能的原因”，把先验概率更新成后验概率。',
              tip: '先验 × 似然 ÷ 证据 = 后验。'
            },
            {
              q: '条件概率 P(B|A) 与 P(A|B) 有什么区别？',
              a: '两者分母不同、方向相反：P(B|A) 是“在 A 已发生的前提下 B 发生”；P(A|B) 是反过来。医学检测题里最容易混淆。',
              tip: '看到“已知……求……”先写清谁的条件，再套公式。'
            }
          ],
          formulas: [
            { label: '条件概率', html: '<span class="m">P(B|A) = <span class="frac"><span>P(AB)</span><span>P(A)</span></span></span>' },
            { label: '乘法公式', html: '<span class="m">P(AB) = P(A)P(B|A)</span>' },
            { label: '全概率公式', html: '<span class="m">P(A) = Σ P(Bᵢ)P(A|Bᵢ)</span>' },
            { label: '贝叶斯公式', html: '<span class="m">P(Bᵢ|A) = <span class="frac"><span>P(Bᵢ)P(A|Bᵢ)</span><span>Σ P(Bⱼ)P(A|Bⱼ)</span></span></span>' }
          ],
          pitfalls: [
            '把 P(B|A) 与 P(A|B) 混为一谈（检察官谬误 / 医学检测）。',
            '全概率公式的前提：完备事件组要互斥且覆盖全部。',
            '乘法公式漏乘前一步的条件概率。'
          ],
          example: {
            title: '医学检测：阳性不等于患病',
            problem: '某病患病率 1%，检测灵敏度 99%（患病者阳性率），特异度 95%（未患病者阴性率）。某人检测阳性，求他真正患病的概率。',
            steps: [
              '设 D=患病，+=检测阳性。P(D)=0.01，P(+|D)=0.99，P(+|D̄)=0.05。',
              '全概率：P(+)=0.01×0.99+0.99×0.05=0.0099+0.0495=0.0594。',
              '贝叶斯：P(D|+)=0.0099/0.0594≈0.167。'
            ],
            answer: '≈16.7%——远低于直觉中的 99%，因为基础率太低。'
          }
        },
        {
          id: '1-6',
          num: '§6',
          title: '独立性',
          minutes: 12,
          intro: '独立是“一个事件发生与否不影响另一个事件的概率”。它由乘法公式定义，不是“互不相干”的直觉；独立和互斥是两件完全不同的事。',
          cards: [
            {
              q: '两个事件独立怎么定义？它和互斥一样吗？',
              a: '<span class="m">P(AB)=P(A)P(B)</span>（等价地，P(A)&gt;0 时 <span class="m">P(B|A)=P(B)</span>）。独立与互斥完全不同：互斥事件若概率都为正，反而不独立。',
              tip: '独立看“乘法”，互斥看“交集为空”。'
            },
            {
              q: '若 A、B 独立，能否推出 A 与 B̄、Ā 与 B、Ā 与 B̄ 也独立？',
              a: '能。独立的“补运算封闭”，这四对都独立。可用 <span class="m">P(A B̄)=P(A)−P(AB)</span> 证明。'
            },
            {
              q: 'n 个事件“相互独立”的定义是什么？两两独立够吗？',
              a: '相互独立要求任意 k 个（k≥2）事件的积概率等于各自概率之积，共 <span class="m">2ⁿ−n−1</span> 个等式。两两独立不够：存在两两独立但不相互独立的经典反例。'
            },
            {
              q: 'n 重伯努利试验是什么？恰好成功 k 次的概率？',
              a: '每次试验只关心 A 发生 / 不发生，各次独立重复 n 次；<span class="m">P(恰好 k 次)=C(n,k)pᵏ(1−p)ⁿ⁻ᵏ</span>，即二项分布 B(n,p)。'
            }
          ],
          formulas: [
            { label: '两事件独立', html: '<span class="m">P(AB) = P(A)P(B)</span>' },
            { label: '伯努利概型', html: '<span class="m">P(X=k) = C(n,k)pᵏ(1−p)ⁿ⁻ᵏ</span>' }
          ],
          pitfalls: [
            '把“独立”写成“互斥”；把“互斥”写成“独立”。',
            '多事件只验证两两独立，就断言相互独立。',
            '小概率事件重复很多次，“至少一次”的概率会接近 1，别惊讶。'
          ],
          example: {
            title: '三人独立破译',
            problem: '甲、乙、丙三人独立破译同一密码，破译概率分别为 1/3、1/4、1/5。求密码被破译的概率。',
            steps: [
              '“被破译”=至少一人成功，用对立事件。',
              '三人都失败的概率 =(2/3)×(3/4)×(4/5)=2/5。',
              'P=1−2/5=3/5。'
            ],
            answer: '3/5'
          }
        }
      ]
    },
    {
      id: 2,
      emoji: '📈',
      title: '随机变量及其分布',
      subtitle: '分布律 · 分布函数 · 概率密度 · 常见分布 · 函数的分布',
      sections: [
        {
          id: '2-1',
          num: '§1',
          title: '随机变量',
          minutes: 7,
          intro: '把样本点映射成实数，概率问题就能用函数与微积分来研究。随机变量不是“随机的数”，而是“结果的函数”。',
          cards: [
            {
              q: '随机变量是什么？',
              a: '定义在样本空间 S 上的实值函数 <span class="m">X=X(e)</span>。每个样本点 e 对应一个实数 X(e)。'
            },
            {
              q: '随机变量和普通函数有什么不同？',
              a: '定义域是样本空间而不是数集；它的取值带有概率。事件 <span class="m">{X≤x}</span> 表示 <span class="m">{e : X(e)≤x}</span>。'
            },
            {
              q: '随机变量主要分哪两类？',
              a: '离散型：全部取值有限或可列；连续型：取值充满某个区间（存在概率密度）。本课程主要研究这两类。'
            },
            {
              q: '引入随机变量的意义是什么？',
              a: '把事件用数值不等式表示，从而可以用分布函数、密度、求和与积分统一处理，并进一步研究数字特征。'
            }
          ],
          formulas: [
            { label: '随机变量', html: '<span class="m">X : S → ℝ，&nbsp; e ↦ X(e)</span>' },
            { label: '事件的数值表示', html: '<span class="m">{X ≤ x} = {e : X(e) ≤ x}</span>' }
          ],
          pitfalls: [
            '把随机变量当成“随机的数”：它是函数，值由试验结果决定。',
            '<span class="m">{X=a}</span> 可能是空事件，也可能概率为 0，不能想当然。'
          ],
          example: {
            title: '把事件翻译成随机变量的取值',
            problem: '抛一枚硬币两次，令 X=正面出现的次数，写出 X 的取值及对应事件。',
            steps: [
              '样本空间 S={HH,HT,TH,TT}。',
              'X 的取值为 0、1、2。',
              '{X=0}={TT}，{X=1}={HT,TH}，{X=2}={HH}。'
            ],
            answer: 'X∈{0,1,2}，对应事件如上'
          }
        },
        {
          id: '2-2',
          num: '§2',
          title: '离散型随机变量及其分布律',
          minutes: 18,
          intro: '离散型随机变量由“分布律”完全刻画：每个取值配一个概率。常见分布要能认出现象、说出参数、写出公式。',
          cards: [
            {
              q: '离散型随机变量的分布律要满足什么条件？',
              a: '<span class="m">P(X=xₖ)=pₖ</span>，<span class="m">pₖ≥0</span>，且 <span class="m">Σpₖ=1</span>。分布函数 <span class="m">F(x)=Σ_{xₖ≤x} pₖ</span>。'
            },
            {
              q: '0-1 分布与二项分布是什么关系？',
              a: '一次伯努利试验的成功次数服从 0-1 分布 B(1,p)；n 次独立重复的成功次数服从二项分布 B(n,p)，<span class="m">P(X=k)=C(n,k)pᵏ(1−p)ⁿ⁻ᵏ</span>。'
            },
            {
              q: '泊松分布长什么样？什么时候用它近似二项分布？',
              a: '<span class="m">P(X=k)=λᵏe^(−λ)/k!</span>，k=0,1,2,…。当 n 很大、p 很小，令 <span class="m">λ=np</span>，二项分布可用泊松分布近似（经验上 n≥20、p≤0.05 效果较好）。'
            },
            {
              q: '几何分布与超几何分布分别描述什么？',
              a: '几何分布：独立重复试验中“首次成功”所需次数，<span class="m">P(X=k)=(1−p)ᵏ⁻¹p</span>，k=1,2,…，具有无记忆性。超几何分布：不放回抽样中次品个数，<span class="m">P(X=k)=C(M,k)C(N−M,n−k)/C(N,n)</span>。'
            },
            {
              q: '二项、泊松、几何、超几何，怎么快速辨认？',
              a: '独立重复、固定次数 → 二项；稀有事件、单位时间 / 面积计数 → 泊松；首次成功 → 几何；不放回、两类物品 → 超几何。'
            }
          ],
          formulas: [
            { label: '二项分布', html: '<span class="m">P(X=k)=C(n,k)pᵏ(1−p)ⁿ⁻ᵏ，&nbsp;k=0,…,n</span>' },
            { label: '泊松分布', html: '<span class="m">P(X=k)=<span class="frac"><span>λᵏe^(−λ)</span><span>k!</span></span>，&nbsp;k=0,1,2,…</span>' },
            { label: '几何分布', html: '<span class="m">P(X=k)=(1−p)ᵏ⁻¹p，&nbsp;k=1,2,…</span>' },
            { label: '超几何分布', html: '<span class="m">P(X=k)=<span class="frac"><span>C(M,k)C(N−M,n−k)</span><span>C(N,n)</span></span></span>' }
          ],
          pitfalls: [
            '几何分布从 k=1 开始，不是 0。',
            '二项分布要求“独立重复”，不放回抽样不是二项。',
            '泊松近似要检查 n 大 p 小，别乱套。'
          ],
          example: {
            title: '射击：二项分布',
            problem: '某射手中靶率 0.8，独立射击 5 次。求恰中 3 次、至少中 1 次的概率。',
            steps: [
              '恰中 3 次：C(5,3)(0.8)³(0.2)²=10×0.512×0.04=0.2048。',
              '至少中 1 次的对立事件是 5 次全不中，概率 0.2⁵=0.00032。',
              'P(至少 1 次)=1−0.00032=0.99968。'
            ],
            answer: '0.2048；0.99968'
          }
        },
        {
          id: '2-3',
          num: '§3',
          title: '随机变量的分布函数',
          minutes: 9,
          intro: '分布函数 F(x)=P(X≤x) 是随机变量的“身份证”：离散型看阶梯，连续型看曲线。',
          cards: [
            {
              q: '分布函数怎么定义？有哪三条基本性质？',
              a: '<span class="m">F(x)=P(X≤x)</span>，x∈ℝ。性质：单调不减；右连续；<span class="m">F(−∞)=0，F(+∞)=1</span>。'
            },
            {
              q: '怎么用分布函数求概率？',
              a: '<span class="m">P(a&lt;X≤b)=F(b)−F(a)</span>；<span class="m">P(X=a)=F(a)−F(a−0)</span>（跳跃高度）；<span class="m">P(X&gt;a)=1−F(a)</span>。'
            },
            {
              q: '离散型和连续型的分布函数各有什么特点？',
              a: '离散型是阶梯函数，在每个取值处跳跃，跳跃高度等于该点概率；连续型 F 连续，且 <span class="m">P(X=a)=0</span>。'
            },
            {
              q: '判断一个函数能否作为分布函数，要检查什么？',
              a: '单调不减、右连续、两端极限分别为 0 和 1；再检查取值在 [0,1]。缺一不可。'
            }
          ],
          formulas: [
            { label: '分布函数', html: '<span class="m">F(x)=P(X≤x)</span>' },
            { label: '区间概率', html: '<span class="m">P(a&lt;X≤b)=F(b)−F(a)</span>' }
          ],
          pitfalls: [
            'F 的定义是“≤”，所以 <span class="m">P(a&lt;X≤b)=F(b)−F(a)</span>，不是 F(b−0)−F(a−0)。',
            '只看单调和极限，忘了右连续。',
            '连续型单点概率为 0，但 {X=a} 依然可能是事件。'
          ],
          example: {
            title: '用 F 求区间概率',
            problem: '已知 F(x)=0（x&lt;0），F(x)=1−e^(−x)（x≥0）。求 P(1&lt;X≤2)。',
            steps: [
              '连续型，直接用 F(b)−F(a)。',
              'F(2)=1−e^(−2)，F(1)=1−e^(−1)。',
              'P=(1−e^(−2))−(1−e^(−1))=e^(−1)−e^(−2)≈0.2325。'
            ],
            answer: 'e^(−1)−e^(−2)≈0.2325'
          }
        },
        {
          id: '2-4',
          num: '§4',
          title: '连续型随机变量及其概率密度',
          minutes: 20,
          intro: '连续型随机变量用概率密度描述。密度不是概率，但“密度曲线下的面积”是概率。均匀、指数、正态是三种必须条件反射的分布。',
          cards: [
            {
              q: '概率密度 f(x) 要满足什么？概率怎么用密度算？',
              a: '<span class="m">f(x)≥0</span>，<span class="m">∫f(x)dx=1</span>；<span class="m">F(x)=∫_{−∞}^x f(t)dt</span>；<span class="m">P(a&lt;X≤b)=∫_a^b f(x)dx</span>。f(x) 可以大于 1。'
            },
            {
              q: '均匀分布 U(a,b) 的密度和分布函数？',
              a: '<span class="m">f(x)=1/(b−a)</span>（a&lt;x&lt;b）；<span class="m">F(x)=(x−a)/(b−a)</span>（a≤x&lt;b）。落在等长子区间的概率相等。'
            },
            {
              q: '指数分布 E(λ) 的密度、分布函数和无记忆性？',
              a: '<span class="m">f(x)=λe^(−λx)</span>（x&gt;0）；<span class="m">F(x)=1−e^(−λx)</span>；<span class="m">P(X&gt;s+t | X&gt;s)=P(X&gt;t)</span>。常用于寿命、等待时间。'
            },
            {
              q: '正态分布 N(μ,σ²) 怎么标准化？',
              a: '<span class="m">Z=(X−μ)/σ ~ N(0,1)</span>；<span class="m">P(a&lt;X≤b)=Φ((b−μ)/σ)−Φ((a−μ)/σ)</span>；<span class="m">Φ(−x)=1−Φ(x)</span>。σ 越大曲线越矮胖，μ 决定中心。'
            },
            {
              q: '正态分布的“3σ 原则”是什么？',
              a: '<span class="m">P(|X−μ|&lt;σ)≈0.6826</span>，<span class="m">P(|X−μ|&lt;2σ)≈0.9544</span>，<span class="m">P(|X−μ|&lt;3σ)≈0.9974</span>。超出 3σ 的概率很小。'
            }
          ],
          formulas: [
            { label: '均匀分布', html: '<span class="m">f(x)=<span class="frac"><span>1</span><span>b−a</span></span>，&nbsp;a&lt;x&lt;b</span>' },
            { label: '指数分布', html: '<span class="m">f(x)=λe^(−λx)，&nbsp;x&gt;0</span>' },
            { label: '正态密度', html: '<span class="m">f(x)=<span class="frac"><span>1</span><span>√(2π)σ</span></span>e^(−(x−μ)²/(2σ²))</span>' },
            { label: '标准化', html: '<span class="m">P(a&lt;X≤b)=Φ(<span class="frac"><span>b−μ</span><span>σ</span></span>)−Φ(<span class="frac"><span>a−μ</span><span>σ</span></span>)</span>' }
          ],
          pitfalls: [
            '把 f(x) 当成概率：f(x) 可以大于 1，只有积分才是概率。',
            '正态标准化忘记除以 σ。',
            '连续型区间端点开闭不影响概率，但计算时别把 P(a&lt;X&lt;b) 写成 F(a)−F(b)。'
          ],
          example: {
            title: '正态分布标准化',
            problem: '设 X~N(2,9)，求 P(0&lt;X&lt;5)。（Φ(1)=0.8413，Φ(2/3)≈0.7475）',
            steps: [
              '标准化：Z=(X−2)/3 ~ N(0,1)。',
              'P(0&lt;X&lt;5)=P(−2/3&lt;Z&lt;1)=Φ(1)−Φ(−2/3)。',
              'Φ(−2/3)=1−Φ(2/3)≈0.2525。',
              'P≈0.8413−0.2525=0.5888。'
            ],
            answer: '≈0.5888'
          }
        },
        {
          id: '2-5',
          num: '§5',
          title: '随机变量的函数的分布',
          minutes: 12,
          intro: '已知 X 的分布，求 Y=g(X) 的分布。离散型合并概率，连续型用“反函数 + 雅可比”或“分布函数法”。',
          cards: [
            {
              q: '离散型随机变量做函数变换，怎么求 Y=g(X) 的分布律？',
              a: '先列出 X 的所有取值和概率，算出对应的 y=g(x)，把相同 y 的概率相加：<span class="m">P(Y=y)=Σ_{x:g(x)=y}P(X=x)</span>。'
            },
            {
              q: '连续型且 g 单调可导时，Y=g(X) 的密度公式？',
              a: '设 x=h(y) 是反函数，则 <span class="m">f_Y(y)=f_X(h(y))·|h′(y)|</span>，并先确定 y 的取值范围（g 的值域）。'
            },
            {
              q: 'g 不单调时怎么办？',
              a: '用分布函数法：<span class="m">F_Y(y)=P(g(X)≤y)</span>，解不等式得到 X 的取值区间，用 F_X 表示，再对 y 求导得 f_Y(y)。'
            },
            {
              q: '两个常用结论？',
              a: '若 <span class="m">X~N(μ,σ²)</span>，则 <span class="m">aX+b~N(aμ+b,a²σ²)</span>；若 <span class="m">X~U(0,1)</span>，则 <span class="m">Y=−ln X~E(1)</span>（逆变换采样）。'
            }
          ],
          formulas: [
            { label: '单调变换', html: '<span class="m">f_Y(y)=f_X(h(y))|h′(y)|</span>' },
            { label: '正态线性变换', html: '<span class="m">aX+b ~ N(aμ+b，a²σ²)</span>' }
          ],
          pitfalls: [
            '忘记写 Y 的取值范围。',
            '忘记乘雅可比 |h′(y)|。',
            '非单调函数直接套反函数公式（应分段或用分布函数法）。'
          ],
          example: {
            title: '线性变换',
            problem: '设 X~U(0,1)，Y=2X+1，求 Y 的密度。',
            steps: [
              'X 的密度 f_X(x)=1（0&lt;x&lt;1）。',
              'y=2x+1 单调，反函数 x=(y−1)/2，dx/dy=1/2。',
              'Y 的取值范围 (1,3)，f_Y(y)=1×1/2=1/2。'
            ],
            answer: 'f_Y(y)=1/2（1&lt;y&lt;3），其他为 0'
          }
        }
      ]
    },
    {
      id: 3,
      emoji: '🧊',
      title: '多维随机变量及其分布',
      subtitle: '联合分布 · 边缘分布 · 条件分布 · 独立性 · 两个随机变量函数的分布',
      sections: [
        {
          id: '3-1',
          num: '§1',
          title: '二维随机变量',
          minutes: 14,
          intro: '两个随机变量放在一起，要用联合分布描述。联合分布包含全部信息，是本章的“总账本”。',
          cards: [
            {
              q: '二维随机变量的联合分布函数怎么定义？',
              a: '<span class="m">F(x,y)=P(X≤x, Y≤y)</span>。它关于 x、y 分别单调不减、右连续；<span class="m">F(−∞,y)=F(x,−∞)=0</span>，<span class="m">F(+∞,+∞)=1</span>。'
            },
            {
              q: '怎么用联合分布函数算矩形概率？',
              a: '<span class="m">P(x₁&lt;X≤x₂, y₁&lt;Y≤y₂)=F(x₂,y₂)−F(x₂,y₁)−F(x₁,y₂)+F(x₁,y₁)</span>。',
              tip: '四个角，正负交替。'
            },
            {
              q: '离散型与连续型的联合分布怎么表示？',
              a: '离散型用联合分布律 <span class="m">p_ij=P(X=x_i,Y=y_j)</span>，<span class="m">ΣΣp_ij=1</span>；连续型用联合密度 <span class="m">f(x,y)≥0</span>，<span class="m">∬f=1</span>，<span class="m">P((X,Y)∈G)=∬_G f</span>。'
            },
            {
              q: '联合分布和边缘分布，谁决定谁？',
              a: '联合分布可以唯一确定边缘分布；边缘分布一般不能确定联合分布（丢失了变量间的相依信息），除非再加上独立性等条件。'
            }
          ],
          formulas: [
            { label: '联合分布函数', html: '<span class="m">F(x,y)=P(X≤x, Y≤y)</span>' },
            { label: '联合密度', html: '<span class="m">F(x,y)=∫_{−∞}^x∫_{−∞}^y f(u,v)dudv</span>' },
            { label: '矩形概率', html: '<span class="m">F(x₂,y₂)−F(x₂,y₁)−F(x₁,y₂)+F(x₁,y₁)</span>' }
          ],
          pitfalls: [
            '把联合密度 f(x,y) 当作概率（它是密度）。',
            '算二重积分不画区域，上下限写错。',
            '矩形概率公式漏项或符号写错。'
          ],
          example: {
            title: '三角形区域上的二重积分',
            problem: '设 (X,Y) 的联合密度 f(x,y)=2（0&lt;y&lt;x&lt;1），其他为 0。求 P(X+Y&lt;1)。',
            steps: [
              '区域 0&lt;y&lt;x&lt;1 与 x+y&lt;1 的交集：0&lt;x&lt;1，0&lt;y&lt;min(x,1−x)。',
              '面积 = ∫₀^{1/2}x dx + ∫_{1/2}^1(1−x)dx = 1/8+1/8=1/4。',
              '密度为常数 2，P=2×1/4=1/2。'
            ],
            answer: '1/2'
          }
        },
        {
          id: '3-2',
          num: '§2',
          title: '边缘分布',
          minutes: 12,
          intro: '从联合分布“投影”到单个变量，就是边缘分布：对另一个变量求和或积分。',
          cards: [
            {
              q: '边缘分布函数怎么由联合分布函数得到？',
              a: '<span class="m">F_X(x)=F(x,+∞)</span>，<span class="m">F_Y(y)=F(+∞,y)</span>。'
            },
            {
              q: '离散型的边缘分布律怎么算？',
              a: '对联合分布律的行 / 列求和：<span class="m">p_{X,i}=Σ_j p_ij</span>，<span class="m">p_{Y,j}=Σ_i p_ij</span>。'
            },
            {
              q: '连续型的边缘密度怎么算？',
              a: '<span class="m">f_X(x)=∫f(x,y)dy</span>，<span class="m">f_Y(y)=∫f(x,y)dx</span>。积分时把另一个变量积掉，上下限由支撑区域决定。'
            },
            {
              q: '为什么边缘分布不能反推联合分布？',
              a: '边缘分布丢掉了 X 与 Y 的相依关系。不同的联合分布可以拥有相同的边缘分布。'
            }
          ],
          formulas: [
            { label: '边缘密度', html: '<span class="m">f_X(x)=∫_{−∞}^{+∞} f(x,y)dy</span>' },
            { label: '边缘分布律', html: '<span class="m">p_{X,i}=Σ_j p_ij</span>' }
          ],
          pitfalls: [
            '积分上下限没有按联合密度的支撑区域确定。',
            '离散型求边缘时把“行和 / 列和”弄反。',
            '以为两个边缘分布相同就独立（完全错误）。'
          ],
          example: {
            title: '三角形区域的边缘密度',
            problem: '设 f(x,y)=2（0&lt;y&lt;x&lt;1），求边缘密度 f_X(x) 与 f_Y(y)。',
            steps: [
              'f_X(x)=∫₀^x 2dy=2x，0&lt;x&lt;1。',
              'f_Y(y)=∫_y^1 2dx=2(1−y)，0&lt;y&lt;1。',
              '验证：∫₀^1 2x dx=1，∫₀^1 2(1−y)dy=1。'
            ],
            answer: 'f_X(x)=2x（0&lt;x&lt;1）；f_Y(y)=2(1−y)（0&lt;y&lt;1）'
          }
        },
        {
          id: '3-3',
          num: '§3',
          title: '条件分布',
          minutes: 12,
          intro: '固定一个变量后，另一个变量的分布就是条件分布。它是“联合 ÷ 边缘”。',
          cards: [
            {
              q: '离散型的条件分布律怎么算？',
              a: '当 <span class="m">P(Y=y_j)&gt;0</span> 时，<span class="m">P(X=x_i|Y=y_j)=p_ij/p_{Y,j}</span>。固定 y_j 后，对 i 的概率之和为 1。'
            },
            {
              q: '连续型的条件密度怎么算？',
              a: '当 <span class="m">f_Y(y)&gt;0</span> 时，<span class="m">f_{X|Y}(x|y)=f(x,y)/f_Y(y)</span>。它作为 x 的函数，积分为 1。'
            },
            {
              q: '条件密度与联合密度、边缘密度的关系？',
              a: '<span class="m">f(x,y)=f_{X|Y}(x|y)f_Y(y)=f_{Y|X}(y|x)f_X(x)</span>；对条件密度再乘边缘密度积分可回到底层变量的密度。'
            },
            {
              q: '条件分布为什么重要？',
              a: '它描述“已知信息后的分布”，是贝叶斯推断、回归、马尔可夫链等的基础；也能让复杂联合分布拆成“边缘 × 条件”。'
            }
          ],
          formulas: [
            { label: '条件密度', html: '<span class="m">f_{X|Y}(x|y)=<span class="frac"><span>f(x,y)</span><span>f_Y(y)</span></span></span>' },
            { label: '乘法分解', html: '<span class="m">f(x,y)=f_{X|Y}(x|y)f_Y(y)</span>' }
          ],
          pitfalls: [
            '条件密度分母用成联合密度或 1。',
            '条件密度的取值范围随条件 y 变化，别写成固定区间。',
            '离散型条件概率要求条件事件概率大于 0。'
          ],
          example: {
            title: '给定 Y 时的条件密度',
            problem: '承上，f(x,y)=2（0&lt;y&lt;x&lt;1）。求给定 Y=0.2 时 X 的条件密度，并求 P(X&gt;0.5|Y=0.2)。',
            steps: [
              'f_Y(y)=2(1−y)，所以 f_{X|Y}(x|y)=2/[2(1−y)]=1/(1−y)，y&lt;x&lt;1。',
              '当 y=0.2：f_{X|Y}(x|0.2)=1/0.8=1.25，0.2&lt;x&lt;1，即 U(0.2,1)。',
              'P(X&gt;0.5|Y=0.2)=(1−0.5)/(1−0.2)=0.625。'
            ],
            answer: '条件密度 1/(1−y)（y&lt;x&lt;1）；概率 0.625'
          }
        },
        {
          id: '3-4',
          num: '§4',
          title: '相互独立的随机变量',
          minutes: 12,
          intro: '两个随机变量独立，就是联合分布等于边缘分布的乘积。判断独立：先求边缘，再比较。',
          cards: [
            {
              q: '随机变量 X、Y 相互独立怎么定义？',
              a: '对一切 x,y，<span class="m">F(x,y)=F_X(x)F_Y(y)</span>。等价地：离散型 <span class="m">p_ij=p_i p_j</span>；连续型 <span class="m">f(x,y)=f_X(x)f_Y(y)</span>（几乎处处成立）。'
            },
            {
              q: '判断连续型随机变量独立的标准步骤？',
              a: '先求两个边缘密度；再看联合密度能否在所有点上写成两个一元函数的乘积（或直接验证 f=f_X f_Y）。支撑区域必须是“矩形”型才可能独立。'
            },
            {
              q: '独立有什么用处？',
              a: '联合分布可由边缘相乘得到；求概率、求函数分布可拆开；独立时卷积公式、max/min 公式都更简洁。'
            },
            {
              q: '“不相关”和“独立”一样吗？',
              a: '不一样。独立一定不相关；不相关不一定独立（二维正态分布是特例，两者等价）。相关系数是第四章内容，这里先建立直觉。'
            }
          ],
          formulas: [
            { label: '独立定义', html: '<span class="m">F(x,y)=F_X(x)F_Y(y)</span>' },
            { label: '连续型判据', html: '<span class="m">f(x,y)=f_X(x)f_Y(y)</span>' },
            { label: '离散型判据', html: '<span class="m">p_ij=p_i p_j</span>' }
          ],
          pitfalls: [
            '只在个别点验证 f=f_Xf_Y，连续型要“几乎处处”。',
            '支撑区域是三角形 / 圆形却断言独立（通常不独立）。',
            '把“不相关”当“独立”。'
          ],
          example: {
            title: '看支撑区域判断独立',
            problem: '判断 f(x,y)=e^(−x−y)（x&gt;0,y&gt;0）与 f(x,y)=2（0&lt;y&lt;x&lt;1）的独立性。',
            steps: [
              '第一种：f_X(x)=e^(−x)，f_Y(y)=e^(−y)，乘积等于联合密度，独立。',
              '第二种：f_X(x)=2x，f_Y(y)=2(1−y)，乘积 4x(1−y)≠2，不独立。',
              '几何上：矩形支撑 + 可分离密度 → 独立；三角形支撑 → 不独立。'
            ],
            answer: '前者独立，后者不独立'
          }
        },
        {
          id: '3-5',
          num: '§5',
          title: '两个随机变量的函数的分布',
          minutes: 16,
          intro: '求 Z=g(X,Y) 的分布：离散型枚举合并，连续型用分布函数法或卷积。重点掌握 Z=X+Y 与 max/min。',
          cards: [
            {
              q: '独立的连续型随机变量，Z=X+Y 的密度公式？',
              a: '<span class="m">f_Z(z)=∫f_X(x)f_Y(z−x)dx</span>，称为卷积。积分限由 f_X(x)&gt;0 与 f_Y(z−x)&gt;0 共同决定。'
            },
            {
              q: '正态、二项、泊松分布的可加性？',
              a: '独立时：<span class="m">N(μ₁,σ₁²)+N(μ₂,σ₂²)~N(μ₁+μ₂,σ₁²+σ₂²)</span>；<span class="m">B(n₁,p)+B(n₂,p)~B(n₁+n₂,p)</span>；<span class="m">P(λ₁)+P(λ₂)~P(λ₁+λ₂)</span>。'
            },
            {
              q: 'M=max(X,Y) 与 N=min(X,Y) 的分布函数？',
              a: '独立时 <span class="m">F_M(z)=F_X(z)F_Y(z)</span>；<span class="m">F_N(z)=1−[1−F_X(z)][1−F_Y(z)]</span>。',
              tip: '最大值“全都 ≤z”，最小值“至少一个 ≤z”，用补事件更好想。'
            },
            {
              q: '一般函数 Z=g(X,Y) 的分布函数法步骤？',
              a: '① 写出 <span class="m">F_Z(z)=P(g(X,Y)≤z)</span>；② 在联合密度非零区域解不等式 g(x,y)≤z，画区域；③ 二重积分得 F_Z(z)；④ 对 z 求导得 f_Z(z)。'
            }
          ],
          formulas: [
            { label: '卷积', html: '<span class="m">f_Z(z)=∫_{−∞}^{+∞} f_X(x)f_Y(z−x)dx</span>' },
            { label: '最大值', html: '<span class="m">F_max(z)=F_X(z)F_Y(z)</span>' },
            { label: '最小值', html: '<span class="m">F_min(z)=1−[1−F_X(z)][1−F_Y(z)]</span>' }
          ],
          pitfalls: [
            '卷积积分限不分段，直接套无穷积分。',
            '求 max/min 时用密度直接乘（应该用分布函数）。',
            '离散型函数分布漏掉“不同 (x,y) 映到同一个 z”的合并。'
          ],
          example: {
            title: '两个均匀分布之和',
            problem: '设 X、Y 独立同分布 U(0,1)，求 Z=X+Y 的密度。',
            steps: [
              '0&lt;z&lt;2 时，f_Z(z)=∫f_X(x)f_Y(z−x)dx，被积函数在 0&lt;x&lt;1 且 0&lt;z−x&lt;1 时为 1。',
              '0&lt;z≤1：x∈(0,z)，积分长度 z，f_Z(z)=z。',
              '1&lt;z&lt;2：x∈(z−1,1)，长度 2−z，f_Z(z)=2−z。'
            ],
            answer: 'f_Z(z)=z（0&lt;z≤1），2−z（1&lt;z&lt;2），其他为 0（三角形分布）'
          }
        }
      ]
    }
  ]
};
