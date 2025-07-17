(function(){
  if(!document.getElementById('_nbsp_style')){
    const s=document.createElement('style');
    s.id='_nbsp_style';
    s.textContent='.nbsp_highlight{background:#f8d7da;padding:0 2px;border-radius:2px;}';
    document.head.appendChild(s);
  }

  // Универсальные паттерны для неразрывного пробела
  const patterns = [
    // Инициалы + фамилия: А. С. Пушкин, А.С. Пушкин
    /([А-ЯЁ]\.) ([А-ЯЁ]\.) ([А-ЯЁ][а-яё]+)/g,
    /([А-ЯЁ]\.) ([А-ЯЁ][а-яё]+)/g,
    // Имя + фамилия: Иван Иванов
    /([А-ЯЁ][а-яё]+) ([А-ЯЁ][а-яё]+)/g,
    // Число + ед. изм.: 5 кг, 10 см, 100 %
    /(\d+) (год(а|у|ом|ах)?|гг|кг|см|мм|м|л|с|%|шт|руб|коп|стр|дн|мин|ч|чел|тыс|млн|млрд|трлн)/gi,
    // г. + город: г. Москва
    /(г\.|ул\.|просп\.|пер\.|пл\.|д\.|стр\.|оф\.|кв\.|пос\.|р-н|обл\.|край|респ\.) ([А-ЯЁ][а-яё]+)/g,
    // "и т.д.", "и т.п.", "и др.", "и пр."
    /(и) (т\.д\.|т\.п\.|др\.|пр\.)/gi,
    // № + число: № 5
    /(№) (\d+)/g,
    // Между цифрой и знаком %: 100 %
    /(\d+) (%)/g,
    // Между числом и знаком градуса: 20 C, 20 °C
    /(\d+) (°?[CF])/gi,
    // Между датой и годом: 2024 г.
    /(\d{4}) (г\.|год)/g,
    // Между сокращением и числом: стр. 5, рис. 2
    /(стр\.|рис\.|табл\.|рисунке|таблице|пример|вариант|задание|вопрос) (\d+)/gi,
  ];

  function walk(n){
    if(n.nodeType===3) check(n);
    else if(n.nodeType===1 && !['SCRIPT','STYLE','TEXTAREA','CODE','PRE'].includes(n.nodeName)){
      for(let c of Array.from(n.childNodes)) walk(c);
    }
  }

  function highlightAllMatches(t, regex) {
    let text = t.nodeValue;
    let parent = t.parentNode;
    let match, lastIndex = 0;
    let frag = document.createDocumentFragment();
    regex.lastIndex = 0;
    let found = false;

    while ((match = regex.exec(text)) !== null) {
      found = true;
      // Добавляем текст до пробела
      frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index + match[1].length)));
      // Подсвечиваем пробел
      let span = document.createElement('span');
      span.className = 'nbsp_highlight';
      span.textContent = ' ';
      frag.appendChild(span);
      lastIndex = match.index + match[0].length;
    }
    if (found) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      parent.replaceChild(frag, t);
      return true;
    }
    return false;
  }

  function check(t){
    for(let rx of patterns){
      if (highlightAllMatches(t, rx)) return walk(t.parentNode);
    }
  }

  walk(document.body);
})();
