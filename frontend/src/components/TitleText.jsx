import { useEffect, useState } from 'react';
import { decryptText, isCiphertext } from '../utils/crypto';

const TitleText = ({ text, className }) => {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (isCiphertext(text)) {
        const plain = await decryptText(text);
        if (mounted) setDisplay(plain);
      } else {
        if (mounted) setDisplay(text);
      }
    };
    run();
    return () => { mounted = false; };
  }, [text]);

  return <span className={className}>{display}</span>;
};

export default TitleText;

