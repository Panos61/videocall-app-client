import { useEffect, useState, forwardRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'lodash';
import classNames from 'classnames';

interface Props {
  className?: string;
  value?: string;
  size?: string;
  editingMode?: boolean;
  src?: string;
  onGetSrc?: (src: string | null) => void;
}

const BG_COLORS = [
  'bg-green-500',
  'bg-red-800',
  'bg-amber-300',
  'bg-blue-500',
  'bg-orange-500',
  'bg-blue-800',
  'bg-yellow-400',
  'bg-cyan-500',
  'bg-lime-300',
  'bg-teal-500',
  'bg-fuchsia-700',
  'bg-rose-500',
  'bg-emerald-500',
];

export const Avatar = forwardRef<HTMLDivElement, Props>(
  (
    {
      className,
      value,
      size = 'lg',
      editingMode = false,
      src = null,
      onGetSrc,
    },
    ref
  ) => {
    const [uuid, setUUID] = useState<string>();
    const [displayValue, setDisplayValue] = useState<string | undefined>('');
    const [bgColor, setBgColor] = useState<string | undefined>('bg-green-500');

    const cls = classNames(
      'flex items-center justify-center rounded-full',
      {
        'size-[208px]': size == 'lg',
        'size-[36px]': size == 'md',
        'size-[28px]': size == 'sm',
      },
      bgColor,
      className
    );

    const textCls = classNames('text-white', {
      'text-6xl': size == 'lg',
      'text-sm': size == 'md',
      'text-xs': size == 'sm',
    });

    useEffect(() => {
      setDisplayValue('🐱');
      setBgColor(BG_COLORS[0]);

      const trimmedValue = value?.trim();

      if (trimmedValue) {
        const splitArr: string[] = trimmedValue.trim().split('');

        // checks if the value has a spece between characters
        const isSplitValue: boolean = splitArr.includes(' ');

        const randInt = Math.floor(Math.random() * BG_COLORS.length);
        const randColor = BG_COLORS[randInt];
        setBgColor(randColor);

        const firstInitialChar = splitArr[0]?.toUpperCase();
        if (isSplitValue) {
          const secondInitialIndex = splitArr.lastIndexOf(' ') + 1;
          const secondInitialChar = splitArr[secondInitialIndex].toUpperCase();

          const concatInitials = firstInitialChar.concat(secondInitialChar);
          setDisplayValue(concatInitials);
        } else {
          setDisplayValue(firstInitialChar);
        }
      }
    }, [value]);

    useEffect(() => {
      if (value) {
        const srcID = uuidv4();
        const source = join([srcID, displayValue, bgColor], ':');

        if (onGetSrc) {
          onGetSrc(source);
        }
      }
    }, [value, displayValue, bgColor, onGetSrc]);

    const decodeSrc = () => {
      const decodedString = src?.split(':');

      const id = decodedString?.at(0);
      const value = decodedString?.at(1);
      const color = decodedString?.at(2);

      return { id, value, color };
    };

    const decodedSrc = decodeSrc();

    useEffect(() => {
      if (src) {
        setUUID(decodedSrc.id);
        setDisplayValue(decodedSrc.value);
        setBgColor(decodedSrc.color);
      }
    }, [src, decodedSrc.id, decodedSrc.value, decodedSrc.color]);

    return (
      <div>
        {(src || editingMode) && (
          <div id={uuid} ref={ref} className={cls}>
            <div className={textCls}>{displayValue}</div>
          </div>
        )}
      </div>
    );
  }
);
