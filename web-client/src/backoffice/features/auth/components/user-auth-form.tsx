'use client';
import { Button } from '@bo/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@bo/components/ui/form';
import { Input } from '@bo/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { FormInput } from '@bo/components/forms/form-input';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/backoffice/dashboard/overview';
  const [loading, startTransition] = useTransition();
  const defaultValues = {
    email: 'admin@myridepartner.com',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
          callbackUrl
        });

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Signed In Successfully!');
          router.push(callbackUrl);
        }
      } catch (error) {
        toast.error('An error occurred during sign in');
      }
    });
  };

  return (
    <>
      <Form
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full space-y-2'
      >
        <FormInput
          control={form.control}
          name='email'
          label='Email'
          placeholder='Enter your email...'
          disabled={loading}
        />
        <FormInput
          control={form.control}
          name='password'
          label='Password'
          type='password'
          placeholder='Enter your password...'
          disabled={loading}
        />
        <Button
          disabled={loading}
          className='mt-2 ml-auto w-full'
          type='submit'
        >
          Sign In
        </Button>
      </Form>
    </>
  );
}
