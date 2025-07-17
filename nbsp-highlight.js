(function(){
  if(!document.getElementById('_nbsp_style')){
    const s=document.createElement('style');
    s.id='_nbsp_style';
    s.textContent='.nbsp_highlight{background:#f8d7da;padding:0 2px;border-radius:2px;}';
    document.head.appendChild(s);
  }

  const patterns = [
    { name: "Имя Фамилия", rx: /([А-ЯЁ][а-яё]+) ([А-ЯЁ][а-яё]+)(?=[,.:;!?]|\s|$)/g, idx: 1 },
    { name: "Инициалы + фамилия (двойные)", rx: /([А-ЯЁ]\.) ([А-ЯЁ]\.) ([А-ЯЁ][а-яё]+)/g, idx: 1 },
    { name: "Инициалы + фамилия (одинарные)", rx: /([А-ЯЁ]\.) ([А-ЯЁ][а-яё]+)/g, idx: 1 },
    { name: "Число + ед. изм.", rx: /(\d+) (год(а|у|ом|ах)?|гг|кг|см|мм|м|л|с|%|шт|руб|коп|стр|дн|мин|ч|чел|тыс|млн|млрд|трлн)(?=[,.:;!?]|\s|$)/gi, idx: 1 },
    { name: "г. + город", rx: /(г\.|ул\.|просп\.|пер\.|пл\.|д\.|стр\.|оф\.|кв\.|пос\.|р-н|обл\.|край|респ\.) ([А-ЯЁ][а-яё]+)(?=[,.:;!?]|\s|$)/g, idx: 1 },
    { name: "и т.д./т.п./др./пр.", rx: /(и) (т\.д\.|т\.п\.|др\.|пр\.)(?=[,.:;!?]|\s|$)/gi, idx: 1 },
    { name: "№ + число", rx: /(№) (\d+)(?=[,.:;!?]|\s|$)/g, idx: 1 },
    { name: "Число + %", rx: /(\d+) (%)(?=[,.:;!?]|\s|$)/g, idx: 1 },
    { name: "Число + градус", rx: /(\d+) (°?[CF])(?=[,.:;!?]|\s|$)/gi, idx: 1 },
    { name: "Год", rx: /(\d{4}) (г\.|год)(?=[,.:;!?]|\s|$)/g, idx: 1 },
    { name: "Сокращение + число", rx: /(стр\.|рис\.|табл\.|рисунке|таблице|пример|вариант|задание|вопрос) (\d+)(?=[,.:;!?]|\s|$)/gi, idx: 1 },
  ];

  let nodeCounter = 0;

  function walk(node) {
    if (node.nodeType === 3) {
      processTextNode(node);
    } else if (
      node.nodeType === 1 &&
      !['SCRIPT','STYLE','TEXTAREA','CODE','PRE'].includes(node.nodeName)
    ) {
      Array.from(node.childNodes).forEach(walk);
    }
  }

  function processTextNode(textNode) {
    let text = textNode.nodeValue;
    let parent = textNode.parentNode;
    let replaced = false;
    nodeCounter++;

    console.log(`\n[NBSP] Обрабатываем текстовый узел #${nodeCounter}: "${text}"`);

    for (let {rx, idx, name} of patterns) {
      rx.lastIndex = 0;
      let match, lastIndex = 0;
      let frag = document.createDocumentFragment();
      let found = false;
      let matches = [];

      // Сохраняем все совпадения для логирования
      while ((match = rx.exec(text)) !== null) {
        matches.push({
          match: match[0],
          left: match[idx],
          index: match.index,
          length: match[0].length
        });
      }

      if (matches.length > 0) {
        found = true;
        console.log(`[NBSP] Паттерн "${name}" нашёл ${matches.length} совпадений:`, matches);

        lastIndex = 0;
        rx.lastIndex = 0; // Сброс для повторного прохода
        let matchIdx = 0;
        while ((match = rx.exec(text)) !== null) {
          // До пробела
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index + match[idx].length)));
          // Подсвечиваем пробел
          let span = document.createElement('span');
          span.className = 'nbsp_highlight';
          span.textContent = ' ';
          frag.appendChild(span);
          console.log(`[NBSP] Подсвечиваем пробел после "${match[idx]}" в "${match[0]}" (позиция ${match.index})`);
          lastIndex = match.index + match[0].length;
          matchIdx++;
        }
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        parent.replaceChild(frag, textNode);
        replaced = true;
        break; // После замены снова обходим новые узлы
      } else {
        console.log(`[NBSP] Паттерн "${name}" — совпадений нет.`);
      }
    }

    if (replaced) {
      Array.from(parent.childNodes).forEach(walk);
    }
  }

  walk(document.body);
  console.log("[NBSP] Готово! Всего обработано текстовых узлов:", nodeCounter);
})();
