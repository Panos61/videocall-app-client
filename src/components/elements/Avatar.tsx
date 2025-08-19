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

    // Get shadow style based on current background color
    const getShadowStyle = () => {
      const colorMap: Record<string, string> = {
        'bg-green-500': '0 0 80px 8px rgba(34, 197, 94, 0.6)',
        'bg-red-800': '0 0 80px 8px rgba(153, 27, 27, 0.6)',
        'bg-amber-300': '0 0 80px 8px rgba(252, 211, 77, 0.6)',
        'bg-blue-500': '0 0 80px 8px rgba(59, 130, 246, 0.6)',
        'bg-orange-500': '0 0 80px 8px rgba(249, 115, 22, 0.6)',
        'bg-blue-800': '0 0 80px 8px rgba(30, 64, 175, 0.6)',
        'bg-yellow-400': '0 0 80px 8px rgba(250, 204, 21, 0.6)',
        'bg-cyan-500': '0 0 80px 8px rgba(6, 182, 212, 0.6)',
        'bg-lime-300': '0 0 80px 8px rgba(190, 242, 100, 0.6)',
        'bg-teal-500': '0 0 80px 8px rgba(20, 184, 166, 0.6)',
        'bg-fuchsia-700': '0 0 80px 8px rgba(162, 28, 175, 0.6)',
        'bg-rose-500': '0 0 80px 8px rgba(244, 63, 94, 0.6)',
        'bg-emerald-500': '0 0 80px 8px rgba(16, 185, 129, 0.6)',
      };
      return (
        colorMap[bgColor || 'bg-green-500'] ||
        '0 0 80px 8px rgba(34, 197, 94, 0.6)'
      );
    };

    const cls = classNames(
      'flex items-center justify-center rounded-full',
      {
        'size-[208px]': size == 'lg',
        'size-[72px]': size == 'md',
        'size-[28px]': size == 'sm',
        'shadow-lg': size == 'lg' || size == 'md',
      },
      bgColor,
      className
    );

    const textCls = classNames('text-white', {
      'text-6xl': size == 'lg',
      'text-xl': size == 'md',
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
          <div
            id={uuid}
            ref={ref}
            className={cls}
            style={{
              boxShadow: size == 'lg' ? getShadowStyle() : 'none',
              filter:
                size == 'lg' ? 'drop-shadow(0 0 10px currentColor)' : 'none',
            }}
          >
            <div className={textCls}>{displayValue}</div>
          </div>
        )}
      </div>
    );
  }
);
