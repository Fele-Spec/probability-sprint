/* ============================================================
   间隔复习调度器
   基于 SM-2 的简化版，并按考试日封顶间隔。
   依据：Murray, Horner & Göbel (2025) 数学学习间隔练习 g≈0.28；
   间隔的关键是“快忘记时再提取”，而不是越熟越刷。
   ============================================================ */
(function (root) {
  const DAY = 86400000;
  const MIN = 60000;

  const SRS = {
    DAY: DAY,

    init: function (now) {
      return { reps: 0, ef: 2.5, interval: 0, due: now || Date.now(), lapses: 0, last: null, lastTs: 0 };
    },

    /**
     * 复习一次，返回新的 srs 状态（不修改原对象）
     * @param {object} state 旧状态
     * @param {'again'|'hard'|'good'|'easy'} grade
     * @param {number} now 当前时间戳
     * @param {number} capDays 最长间隔（天），按离考试天数封顶
     */
    review: function (state, grade, now, capDays) {
      const t = now || Date.now();
      const cap = Math.max(0.2, capDays == null ? 30 : capDays);
      const s = Object.assign(SRS.init(t), state || {});

      if (grade === 'again') {
        s.reps = 0;
        s.lapses = (s.lapses || 0) + 1;
        s.ef = Math.max(1.3, s.ef - 0.2);
        s.interval = 10 / 1440; // 10 分钟后同一场次再见到它
      } else if (grade === 'hard') {
        s.reps += 1;
        s.ef = Math.max(1.3, s.ef - 0.15);
        s.interval = s.reps <= 1 ? 0.5 : Math.max(1, (s.interval || 1) * 1.4);
      } else if (grade === 'good') {
        s.reps += 1;
        s.interval = s.reps === 1 ? 1 : s.reps === 2 ? 3 : Math.max(1, (s.interval || 1) * 2);
      } else {
        s.reps += 1;
        s.ef = Math.min(3.0, s.ef + 0.1);
        s.interval = s.reps === 1 ? 2 : Math.max(2, (s.interval || 1) * 2.4);
      }

      s.interval = Math.min(s.interval, cap);
      s.due = t + s.interval * DAY;
      s.last = grade;
      s.lastTs = t;
      return s;
    },

    isDue: function (srs, now) {
      if (!srs || !srs.due) return true;
      return srs.due <= (now || Date.now());
    },

    nextDueText: function (srs, now) {
      if (!srs || !srs.due) return '现在';
      const t = now || Date.now();
      const diff = srs.due - t;
      if (diff <= 0) return '现在';
      if (diff < 60 * MIN) return Math.max(1, Math.round(diff / MIN)) + ' 分钟后';
      if (diff < DAY) return Math.max(1, Math.round(diff / 3600000)) + ' 小时后';
      return Math.max(1, Math.round(diff / DAY)) + ' 天后';
    },

    // 供 UI 展示：下次复习的日期/时间短语
    describe: function (srs) {
      if (!srs || !srs.due) return '未安排';
      return SRS.nextDueText(srs);
    }
  };

  if (typeof window !== 'undefined') window.SRS = SRS;
  if (typeof module !== 'undefined' && module.exports) module.exports = SRS;
})(typeof window !== 'undefined' ? window : globalThis);
