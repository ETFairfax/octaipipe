function NotFound() {
  return (
    <div className='flex flex-1 flex-col gap-2'>
      <p className='text-sm font-medium'>Page not found</p>
      <p className='text-sm text-muted-foreground'>The page you're looking for doesn't exist.</p>
    </div>
  );
}

export { NotFound };
