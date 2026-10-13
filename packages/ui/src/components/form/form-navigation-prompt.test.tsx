import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Form, FormInput, FormProvider, useForm } from '@workspace/ui/components';
import { useMemo } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

const router = vi.hoisted(() => ({
  current: {} as object | undefined,
  shouldBlock: (() => false) as () => boolean
}));

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => router.current,
  useBlocker: ({ shouldBlockFn }: { shouldBlockFn: () => boolean }) => {
    router.shouldBlock = shouldBlockFn;
    return { status: 'idle' };
  }
}));

const Schema = z.object({ name: z.string() });
type Values = z.infer<typeof Schema>;

function TestForm({ guard }: { guard?: 'router' | 'dialog' }) {
  const form = useForm<Values>({
    schema: Schema,
    defaultValues: useMemo(() => ({ name: '' }), [])
  });

  return (
    <FormProvider
      {...form}
      isLoading={false}
      isSubmitting={form.formState.isSubmitting}
      schema={Schema}
      unsavedChangesGuard={guard}
    >
      <Form onSubmit={form.handleSubmit(() => {})}>
        <FormInput name='name' label='Name' />
        <button type='submit'>Save</button>
      </Form>
    </FormProvider>
  );
}

const type = (value: string) =>
  fireEvent.change(screen.getByRole('textbox'), { target: { value } });

describe('FormNavigationPrompt', () => {
  beforeEach(() => {
    router.current = {};
    router.shouldBlock = () => false;
  });
  afterEach(cleanup);

  it('fails with an actionable message when there is no router', () => {
    router.current = undefined;
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestForm />)).toThrow(/unsavedChangesGuard='dialog'/);

    consoleError.mockRestore();
  });

  it("does not need a router with the 'dialog' guard", () => {
    router.current = undefined;
    expect(() => render(<TestForm guard='dialog' />)).not.toThrow();
  });

  it('blocks navigation only while the form is dirty', async () => {
    render(<TestForm />);
    expect(router.shouldBlock()).toBe(false);

    type('Pump');
    await waitFor(() => expect(router.shouldBlock()).toBe(true));
  });

  it('allows navigation after a successful submit, then blocks again once edited', async () => {
    render(<TestForm />);

    type('Pump');
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });
    await waitFor(() => expect(router.shouldBlock()).toBe(false));

    type('Pump 2');
    await waitFor(() => expect(router.shouldBlock()).toBe(true));
  });
});
