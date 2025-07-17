(function(){
  if(!document.getElementById('_nbsp_style')){
    const s=document.createElement('style');
    s.id='_nbsp_style';
    s.textContent='.nbsp_highlight{background:#f8d7da;padding:0 2px;border-radius:2px;}';
    document.head.appendChild(s);
  }

  // Универсальные паттерны для поиска пробела между нужными группами
  const patterns = [
    // Имя Фамилия (и с запятой после фамилии)
    { rx: /(?<=[А-ЯЁ][а-яё]+) (?=[А-ЯЁ][а-яё]+[,.!?:;]?)/g },
    // Инициалы + фамилия
    { rx: /(?<=[А-ЯЁ]\.) (?=[А-ЯЁ]\.)/g },
    { rx: /(?<=[А-ЯЁ]\.) (?=[А-ЯЁ][а-яё]+)/g },
    // Число + ед. изм.
    { rx: /(?<=\d) (?=(год(а|у|ом|ах)?|гг|кг|см|мм|м|л|с|%|шт|руб|коп|стр|дн|мин|ч|чел|тыс|млн|млрд|трлн)[,.!?:;]?)/gi },
    // г. + город
    { rx: /(?<=(г\.|ул\.|просп\.|пер\.|пл\.|д\.|стр\.|оф\.|кв\.|пос\.|р-н|обл\.|край|респ\.)) (?=[А-ЯЁ][а-яё]+)/g },
    // "и т.д.", "и т.п.", "и др.", "и пр."
    { rx: /(?<=и) (?=(т\.д\.|т\.п\.|др\.|пр\.))/gi },
    // № + число
    { rx: /(?<=№) (?=\d+)/g },
    // Между цифрой и знаком %
    { rx: /(?<=\d) (?=%)/g },
    // Между числом и знаком градуса
    { rx: /(?<=\d) (?=°?[CF])/gi },
    // Между датой и годом
    { rx: /(?<=\d{4}) (?=(г\.|год))/g },
    // Между сокращением и числом
    { rx: /(?<=(стр\.|рис\.|табл\.|рисунке|таблице|пример|вариант|задание|вопрос)) (?=\d+)/gi },
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

    patterns.forEach(({rx}) => {
      rx.lastIndex = 0;
      if (rx.test(text)) {
        // Разбиваем текст по совпадениям, чтобы подсветить только пробелы
        let parts = text.split(rx);
        let matches = [...text.matchAll(rx)];
        if (matches.length > 0) {
          let frag = document.createDocumentFragment();
          for (let i = 0; i < parts.length; i++) {
            frag.appendChild(document.createTextNode(parts[i]));
            if (i < parts.length - 1) {
              let span = document.createElement('span');
              span.className = 'nbsp_highlight';
              span.textContent = ' ';
              frag.appendChild(span);
            }
          }
          parent.replaceChild(frag, textNode);
          replaced = true;
        }
      }
    });

    if (replaced) {
      Array.from(parent.childNodes).forEach(walk);
    }
  }

  walk(document.body);
})();
