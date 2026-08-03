'use client';

import {
  type HexColor,
  hexToHsva,
  type HslaColor,
  hslaToHsva,
  type HsvaColor,
  hsvaToHex,
  hsvaToHsla,
  hsvaToRgba,
  type RgbaColor,
  rgbaToHsva,
} from '@uiw/color-convert';
import Hue from '@uiw/react-color-hue';
import Saturation from '@uiw/react-color-saturation';
import { ChevronDownIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

function getColorAsHsva(color: `#${string}` | HsvaColor | HslaColor | RgbaColor): HsvaColor {
  if (typeof color === 'string') {
    return hexToHsva(color);
  } else if ('h' in color && 's' in color && 'v' in color) {
    return color;
  } else if ('r' in color) {
    return rgbaToHsva(color);
  } else {
    return hslaToHsva(color);
  }
}

function colorHsvToHslString(color: HsvaColor): string {
  const { h, s, l, a } = hsvaToHsla(color);
  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
}

type ColorPickerValue = {
  hex: string;
  hsl: HslaColor;
  rgb: RgbaColor;
};

type ColorPickerProps = {
  value?: `#${string}` | HsvaColor | HslaColor | RgbaColor;
  type?: 'hsl' | 'rgb' | 'hex';
  swatches?: HexColor[];
  hideContrastRatio?: boolean;
  hideDefaultSwatches?: boolean;
  className?: string;
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  onValueChange?: (value: ColorPickerValue) => void;
};

function ColorPicker({
  value,
  children,
  type = 'hex',
  swatches = [],
  hideDefaultSwatches,
  onValueChange,
  className,
  open,
  defaultOpen,
  onOpenChange,
  align = 'center',
  sideOffset = 4,
}: ColorPickerProps) {
  const [colorType, setColorType] = React.useState(type);
  const [colorHsv, setColorHsv] = React.useState<HsvaColor>(
    value ? getColorAsHsva(value) : { h: 0, s: 0, v: 0, a: 1 }
  );

  const [prevValue, setPrevValue] = React.useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      setColorHsv(getColorAsHsva(value));
    }
  }

  const handleValueChange = (color: HsvaColor) => {
    setColorHsv(color);
    onValueChange?.({
      hex: hsvaToHex(color),
      hsl: hsvaToHsla(color),
      rgb: hsvaToRgba(color),
    });
  };

  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={sideOffset}
        className={cn('w-87.5 p-0 bg-zinc-900 border-zinc-800 text-white shadow-2xl z-50', className)}
        style={
          {
            '--selected-color': colorHsvToHslString(colorHsv),
          } as React.CSSProperties
        }
      >
        <div className="space-y-3 p-4">
          <Saturation
            hsva={colorHsv}
            onChange={(newColor) => {
              handleValueChange(newColor);
            }}
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '4/2',
              borderRadius: '0.5rem',
            }}
            className="border border-zinc-700/50 shadow-inner"
          />
          <Hue
            hue={colorHsv.h}
            onChange={(newHue) => {
              handleValueChange({ ...colorHsv, ...newHue });
            }}
            className="[&>div:first-child]:overflow-hidden [&>div:first-child]:!rounded-md"
            style={
              {
                width: '100%',
                height: '1rem',
                borderRadius: '0.5rem',
                '--alpha-pointer-background-color': '#FFFFFF',
              } as React.CSSProperties
            }
          />

          <div className="flex items-center gap-2 pt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0 justify-between uppercase bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white h-9 px-3">
                  {colorType}
                  <ChevronDownIcon className="-me-1 ms-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white">
                <DropdownMenuCheckboxItem
                  checked={colorType === 'hex'}
                  onCheckedChange={() => setColorType('hex')}
                  className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer"
                >
                  HEX
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={colorType === 'hsl'}
                  onCheckedChange={() => setColorType('hsl')}
                  className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer"
                >
                  HSL
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={colorType === 'rgb'}
                  onCheckedChange={() => setColorType('rgb')}
                  className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer"
                >
                  RGB
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex grow">
              {colorType === 'hsl' && (
                <HslColorInput
                  value={hsvaToHsla(colorHsv)}
                  onValueChange={(val) => {
                    handleValueChange(hslaToHsva(val));
                  }}
                />
              )}
              {colorType === 'rgb' && (
                <RgbColorInput
                  value={hsvaToRgba(colorHsv)}
                  onValueChange={(val) => {
                    handleValueChange(rgbaToHsva(val));
                  }}
                />
              )}
              {colorType === 'hex' && (
                <Input
                  className="flex h-9 bg-zinc-950 border-zinc-800 text-white font-mono uppercase text-xs"
                  value={hsvaToHex(colorHsv)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val) || /^#?[0-9A-Fa-f]{6}$/.test(val)) {
                      handleValueChange(hexToHsva(val.startsWith('#') ? val : `#${val}`));
                    }
                  }}
                />
              )}
            </div>
          </div>
          {swatches.length > 0 || (!hideDefaultSwatches && <Separator className="bg-zinc-800" />)}
          {!hideDefaultSwatches && (
            <div className="flex flex-wrap justify-start gap-2 pt-1">
              {['#F8371A', '#F97C1B', '#FAC81C', '#3FD0B6', '#2CADF6', '#6462FC', '#007AFF', '#FF2D55', '#10B981', '#6366F1', ...swatches]
                .sort((a, b) => hexToHsva(a).h - hexToHsva(b).h)
                .map((color) => (
                  <button
                    type="button"
                    key={`${color}-swatch`}
                    style={
                      {
                        '--swatch-color': color,
                      } as React.CSSProperties
                    }
                    onClick={() => handleValueChange(hexToHsva(color))}
                    onKeyUp={(e) => (e.key === 'Enter' ? handleValueChange(hexToHsva(color)) : null)}
                    aria-label={`Set color to ${color}`}
                    className="size-5 cursor-pointer rounded-md bg-[var(--swatch-color)] ring-2 ring-[var(--swatch-color)00] ring-offset-1 ring-offset-zinc-900 transition-all duration-100 hover:scale-110 hover:ring-[var(--swatch-color)]"
                  />
                ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function HslColorInput({
  value,
  onValueChange,
}: {
  value: HslaColor;
  onValueChange?: (val: HslaColor) => void;
}) {
  const handleChange = (key: keyof HslaColor, val: string) => {
    const num = Number(val) || 0;
    onValueChange?.({ ...value, [key]: num });
  };

  return (
    <div className="-mt-px flex w-full">
      <div className="relative min-w-0 flex-1 focus-within:z-10">
        <Input
          className="peer rounded-e-none shadow-none h-9 bg-zinc-950 border-zinc-800 text-white font-mono text-xs px-2 text-center"
          value={value.h.toFixed(0)}
          onChange={(e) => handleChange('h', e.target.value)}
        />
      </div>
      <div className="relative -ms-px min-w-0 flex-1 focus-within:z-10">
        <Input
          className="peer rounded-none shadow-none h-9 bg-zinc-950 border-zinc-800 text-white font-mono text-xs px-2 text-center"
          value={value.s.toFixed(0)}
          onChange={(e) => handleChange('s', e.target.value)}
        />
      </div>
      <div className="relative -ms-px min-w-0 flex-1 focus-within:z-10">
        <Input
          className="peer rounded-s-none shadow-none h-9 bg-zinc-950 border-zinc-800 text-white font-mono text-xs px-2 text-center"
          value={value.l.toFixed(0)}
          onChange={(e) => handleChange('l', e.target.value)}
        />
      </div>
    </div>
  );
}

function RgbColorInput({
  value,
  onValueChange,
}: {
  value: RgbaColor;
  onValueChange?: (val: RgbaColor) => void;
}) {
  const handleChange = (key: keyof RgbaColor, val: string) => {
    const num = Number(val) || 0;
    onValueChange?.({ ...value, [key]: num });
  };

  return (
    <div className="-mt-px flex w-full">
      <div className="relative min-w-0 flex-1 focus-within:z-10">
        <Input
          className="peer rounded-e-none shadow-none h-9 bg-zinc-950 border-zinc-800 text-white font-mono text-xs px-2 text-center"
          value={value.r}
          onChange={(e) => handleChange('r', e.target.value)}
        />
      </div>
      <div className="relative -ms-px min-w-0 flex-1 focus-within:z-10">
        <Input
          className="peer rounded-none shadow-none h-9 bg-zinc-950 border-zinc-800 text-white font-mono text-xs px-2 text-center"
          value={value.g}
          onChange={(e) => handleChange('g', e.target.value)}
        />
      </div>
      <div className="relative -ms-px min-w-0 flex-1 focus-within:z-10">
        <Input
          className="peer rounded-s-none shadow-none h-9 bg-zinc-950 border-zinc-800 text-white font-mono text-xs px-2 text-center"
          value={value.b}
          onChange={(e) => handleChange('b', e.target.value)}
        />
      </div>
    </div>
  );
}

export { ColorPicker };
export type { ColorPickerProps, ColorPickerValue };