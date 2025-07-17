(function(){
  if(!document.getElementById('_nbsp_style')){
    const s=document.createElement('style');
    s.id='_nbsp_style';
    s.textContent='.nbsp_highlight{background:#f8d7da;padding:0 2px;border-radius:2px;}';
    document.head.appendChild(s);
  }

  const NBSP_PAIRS = [
    ['г.', '\\d+'],
    ['ул.', '[^\\s]'],
    ['им.', '[А-ЯЁ][а-яё]+'],
    ['[А-Я]\\.', '[А-Я]\\.'],
    ['\\d+', '(?:год|гг|кг|см|мм|%)'],
    ['[А-ЯЁ][а-яёЁ-]+', '[А-ЯЁ][а-яёЁ-]+'],
  ];

  const patterns = NBSP_PAIRS.map(
    ([left, right]) => new RegExp(`(${left}) (${right})`, 'g')
  );

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
      frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index + match[1].length)));
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
