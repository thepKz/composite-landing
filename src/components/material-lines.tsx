export default function MaterialLines() {
  return <svg className="material-lines" viewBox="0 0 1440 680" fill="none" preserveAspectRatio="none" aria-hidden="true">
    {[0, 1, 2, 3, 4, 5].map(index => <path key={index} d={`M ${-180 + index * 50} 700 C ${230 + index * 50} 410, ${770 + index * 28} 820, ${1050 + index * 26} 290 S 1400 -80, 1600 -130`} />)}
  </svg>;
}
