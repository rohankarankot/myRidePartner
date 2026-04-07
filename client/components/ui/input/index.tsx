'use client';
import React from 'react';
import { createInput } from '@gluestack-ui/core/input/creator';
import { View, TextInput, Platform } from 'react-native';
import { tva, withStyleContext, useStyleContext, type VariantProps } from '@gluestack-ui/utils/nativewind-utils';

const SCOPE = 'INPUT';

const inputStyle = tva({
  base: 'flex-row items-center border rounded-[24px] border-background-300 data-[focus=true]:border-primary-500 data-[invalid=true]:border-error-700 data-[hover=true]:border-background-400 bg-background-0 h-11 px-4',
  variants: {
    size: {
      sm: 'h-9 px-3',
      md: 'h-11 px-4',
      lg: 'h-12 px-5',
    },
    variant: {
      outline: 'border',
      underlined: 'border-b rounded-none px-0 bg-transparent',
      rounded: 'rounded-full',
    },
  },
});

const inputFieldStyle = tva({
  base: 'flex-1 text-typography-900 font-medium h-full web:outline-none web:ring-0 px-0',
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
});

const UIInput = createInput({
  Root: withStyleContext(View, SCOPE),
  Icon: View,
  Slot: View,
  Input: TextInput,
});

type IInputProps = React.ComponentPropsWithoutRef<typeof UIInput> &
  VariantProps<typeof inputStyle> & { className?: string };

const Input = React.forwardRef<React.ElementRef<typeof UIInput>, IInputProps>(
  ({ className, variant = 'outline', size = 'md', ...props }, ref) => {
    return (
      <UIInput
        ref={ref}
        {...props}
        className={inputStyle({ variant, size, class: className })}
        context={{ variant, size }}
      />
    );
  }
);

type IInputFieldProps = React.ComponentPropsWithoutRef<typeof UIInput.Input> &
  VariantProps<typeof inputFieldStyle> & { className?: string };

const InputField = React.forwardRef<
  React.ElementRef<typeof UIInput.Input>,
  IInputFieldProps
>(({ className, ...props }, ref) => {
  const { variant: parentVariant, size: parentSize } = useStyleContext(SCOPE);

  return (
    <UIInput.Input
      ref={ref}
      {...props}
      className={inputFieldStyle({
        parentVariants: {
          size: parentSize,
        },
        class: className,
      })}
    />
  );
});

Input.displayName = 'Input';
InputField.displayName = 'InputField';

export { Input, InputField };
