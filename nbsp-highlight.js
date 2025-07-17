(function(){
  // Добавляем стили для подсветки
  if(!document.getElementById('_nbsp_style')){
    const s=document.createElement('style');
    s.id='_nbsp_style';
    s.textContent='.nbsp_highlight{background:#f8d7da;padding:0 2px;border-radius:2px;}';
    document.head.appendChild(s);
  }

  // Словарь склеиваемых пар (можно расширять!)
  const NBSP_PAIRS = [
    // Примеры: [левая часть, правая часть]
    ['г.', '\\d+'], // г. 5
    ['ул.', '[^\\s]'], // ул. Ленина
    ['им.', '[А-ЯЁ][а-яё]+'], // им. Ленина
    ['[А-Я]\\.', '[А-Я]\\.'], // И. И.
    ['\\d+', '(?:год|гг|кг|см|мм|%)'], // 5 кг, 10%
    // Добавь свои пары ниже:
    // ['левая часть', 'правая часть'],
  ];

  // Автоматически сгенерированные регулярки из словаря
  const patterns = NBSP_PAIRS.map(
    ([left, right]) => new RegExp(`(${left}) ([${right}])`, 'g')
  );

  // Дополнительные регулярки для типовых случаев
  const extraPatterns = [
    /([А-ЯЁ][а-яё]+) ([А-ЯЁ][а-яё]+)/g, // Два подряд слова с большой буквы (Имя Фамилия)
    /(\b(?:г|ул|д|т|т\.д|см|рис|стр|с|л|пр|№)\.) (\S)/gi,
    /(\d) (гр|кг|мг|м|см|мм|ч|мин|с|%)/gi,
    /(\d) (янв|февр|марта|апр|мая|июн|июл|авг|сент|окт|нояб|дек)\b/gi,
    /(\w) ([А-Я]\.?[А-Я]\.?)/g,
    /\b([вксупиоя]) (\S)/gi
  ];

  function walk(n){
    if(n.nodeType===3)check(n);
    else if(n.nodeType===1&&!['SCRIPT','STYLE','TEXTAREA','CODE','PRE'].includes(n.nodeName)){
      for(let c of Array.from(n.childNodes))walk(c);
    }
  }

  function check(t){
    let text=t.nodeValue;
    let parent=t.parentNode;
    let replaced = false;

    // Проверяем по словарю
    for(let rx of patterns.concat(extraPatterns)){
      rx.lastIndex=0;
      let m;
      while((m=rx.exec(text))!==null){
        const i=m.index+m[1].length;
        let span=document.createElement('span');
        span.className='nbsp_highlight';
        span.textContent=' ';
        let beforeText=text.slice(0,i);
        let afterText=text.slice(i+1);
        let frag=document.createDocumentFragment();
        frag.appendChild(document.createTextNode(beforeText));
        frag.appendChild(span);
        frag.appendChild(document.createTextNode(afterText));
        parent.replaceChild(frag,t);
        replaced = true;
        break;
      }
      if(replaced) break;
    }
    if(replaced) walk(parent);
  }

  walk(document.body);

  // Для удобства: выводим в консоль, как добавить новую пару
  window.nbspAddPair = function(left, right){
    console.log(`Добавь в NBSP_PAIRS: ['${left}', '${right}']`);
  };
})();
