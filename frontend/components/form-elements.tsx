import { useFormContext } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InputElementProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string  
  label?: string
  description?: string
  isOptional?: boolean
  inputClassName?: string
  labelClassName?: string
}

const InputElement: React.FC<InputElementProps> = ({ name, label, placeholder, description, isOptional, labelClassName, inputClassName, ...props }) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('', props.className)}>
          {label && (
            <FormLabel className={cn('', labelClassName)}>
              {label}
              {isOptional && (
                <span className="text-neutral-400"> (optional)</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              className={cn('', inputClassName)}
              type={props.type || 'text'}
              disabled={props.disabled}
              value={props.value || field.value}
              autoComplete={props.autoComplete}
              onChange={(e) => {
                field.onChange(e); // react-hook-form's on change
                props.onChange?.(e); // custom on change
              }}
            />
          </FormControl>
          {description && (
            <FormDescription>
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default InputElement