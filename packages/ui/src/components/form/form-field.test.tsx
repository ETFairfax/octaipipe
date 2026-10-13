import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  type ErrorResponse,
  Form,
  FormField,
  FormInput,
  FormProvider,
  useForm,
  useFormField
} from '@workspace/ui/components';
import { useMemo } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

// Mirrors how signin-form.tsx actually composes these primitives: a schema-driven useForm()
// feeding FormProvider, with FormInput as the one thing a consuming form renders directly.
const TestSchema = z.object({
  email: z.email('Enter a valid email address').meta({
    label: 'Email',
    hint: 'We only use this to contact you about your account',
    description: 'Must match your billing email'
  }),
  password: z.string().min(1, 'Enter your password').meta({ label: 'Password' })
});

type TestSchemaType = z.infer<typeof TestSchema>;

function ServerErrorCount({ name }: { name: string }) {
  const { fieldServerErrors } = useFormField();
  return <span data-testid={`server-error-count-${name}`}>{fieldServerErrors.length}</span>;
}

function TestForm({ serverErrors = null }: { serverErrors?: ErrorResponse | null }) {
  const form = useForm<TestSchemaType>({
    schema: TestSchema,
    defaultValues: useMemo(() => ({ email: '', password: '' }), [])
  });

  return (
    <FormProvider
      {...form}
      isLoading={false}
      isSubmitting={form.formState.isSubmitting}
      schema={TestSchema}
      serverErrors={serverErrors}
      unsavedChangesGuard='dialog' // No router in this test, so the router blocker can't be used.
    >
      <Form>
        <FormInput name='email' type='email' />
        <FormInput name='password' type='password' />
        <FormField
          control={form.control}
          name='email'
          render={() => <ServerErrorCount name='email' />}
        />
        <FormField
          control={form.control}
          name='password'
          render={() => <ServerErrorCount name='password' />}
        />
      </Form>
    </FormProvider>
  );
}

describe('Form field family (FormProvider + FormField + FormInput)', () => {
  afterEach(() => {
    cleanup();
  });

  it('derives label, hint trigger, and description from schema .meta() through the single useFormField() derivation', () => {
    const { container } = render(<TestForm />);

    expect(screen.getByLabelText('Email')).not.toBeNull();
    expect(screen.getByLabelText('Password')).not.toBeNull();
    expect(screen.getByText('Must match your billing email')).not.toBeNull();

    // Only 'email' has hint meta, so exactly one hint trigger should render across both fields.
    expect(container.querySelectorAll('[data-slot="popover-trigger"]')).toHaveLength(1);
  });

  it('shows the RHF client-side validation message after an invalid blur', async () => {
    render(<TestForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.blur(screen.getByLabelText('Email'));

    expect(await screen.findByText('Enter a valid email address')).not.toBeNull();
  });

  it('shows the RHF client-side validation message for a required field left blank', async () => {
    render(<TestForm />);

    fireEvent.blur(screen.getByLabelText('Password'));

    expect(await screen.findByText('Enter your password')).not.toBeNull();
  });

  it('scopes server errors to the field whose source.pointer matches (use-form-field.tsx fieldServerErrors)', () => {
    const serverErrors: ErrorResponse = {
      data: {
        errors: [
          {
            detail: 'Email is already taken',
            status: 422,
            source: { pointer: '/data/attributes/email', body: '', query: '' }
          }
        ]
      }
    };

    render(<TestForm serverErrors={serverErrors} />);

    expect(screen.getByTestId('server-error-count-email').textContent).toBe('1');
    expect(screen.getByTestId('server-error-count-password').textContent).toBe('0');
  });
});
