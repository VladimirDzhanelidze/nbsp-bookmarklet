(function(){
  if(!document.getElementById('_nbsp_style')){
    const s=document.createElement('style');
    s.id='_nbsp_style';
    s.textContent='.nbsp_highlight{background:#f8d7da;padding:0 2px;border-radius:2px;}';
    document.head.appendChild(s);
  }

  // Паттерны с lookahead для знаков препинания
  const patterns = [
    // Инициалы + фамилия: А. С. Пушкин, А.С. Пушкин
    { rx: /([А-ЯЁ]\.) ([А-ЯЁ]\.) ([А-ЯЁ][а-яё]+)(?=[,.:;!?]|\s|$)/g, idx: [1,2] },
    { rx: /([А-ЯЁ]\.) ([А-ЯЁ][а-яё]+)(?=[,.:;!?]|\s|$)/g, idx: [1] },
    // Имя + фамилия: Иван Иванов
    { rx: /([А-ЯЁ][а-яё]+) ([А-ЯЁ][а-яё]+)(?=[,.:;!?]|\s|$)/g, idx: [1] },
    // Число + ед. изм.: 5 кг, 10 см, 100 %
    { rx: /(\d+) (год(а|у|ом|ах)?|гг|кг|см|мм|м|л|с|%|шт|руб|коп|стр|дн|мин|ч|чел|тыс|млн|млрд|трлн)(?=[,.:;!?]|\s|$)/gi, idx: [1] },
    // г. + город: г. Москва
    { rx: /(г\.|ул\.|просп\.|пер\.|пл\.|д\.|стр\.|оф\.|кв\.|пос\.|р-н|обл\.|край|респ\.) ([А-ЯЁ][а-яё]+)(?=[,.:;!?]|\s|$)/g, idx: [1] },
    // "и т.д.", "и т.п.", "и др.", "и пр."
    { rx: /(и) (т\.д\.|т\.п\.|др\.|пр\.)(?=[,.:;!?]|\s|$)/gi, idx: [1] },
    // № + число: № 5
    { rx: /(№) (\d+)(?=[,.:;!?]|\s|$)/g, idx: [1] },
    // Между цифрой и знаком %: 100 %
    { rx: /(\d+) (%)(?=[,.:;!?]|\s|$)/g, idx: [1] },
    // Между числом и знаком градуса: 20 C, 20 °C
    { rx: /(\d+) (°?[CF])(?=[,.:;!?]|\s|$)/gi, idx: [1] },
    // Между датой и годом: 2024 г.
    { rx: /(\d{4}) (г\.|год)(?=[,.:;!?]|\s|$)/g, idx: [1] },
    // Между сокращением и числом: стр. 5, рис. 2
    { rx: /(стр\.|рис\.|табл\.|рисунке|таблице|пример|вариант|задание|вопрос) (\d+)(?=[,.:;!?]|\s|$)/gi, idx: [1] },
  ];

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

    patterns.forEach(({rx, idx}) => {
      rx.lastIndex = 0;
      let match, lastIndex = 0;
      let frag = document.createDocumentFragment();
      let found = false;

      while ((match = rx.exec(text)) !== null) {
        found = true;
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index + match[idx[0]].length)));
        let span = document.createElement('span');
        span.className = 'nbsp_highlight';
        span.textContent = ' ';
        frag.appendChild(span);
        lastIndex = match.index + match[0].length;
      }
      if (found) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        parent.replaceChild(frag, textNode);
        replaced = true;
      }
    });

    if (replaced) {
      Array.from(parent.childNodes).forEach(walk);
    }
  }

  walk(document.body);
})();
