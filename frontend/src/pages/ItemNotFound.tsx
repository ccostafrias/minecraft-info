import { Link, useRouteError } from 'react-router-dom';

export default function ItemNotFound() {
  const error: any = useRouteError();
  console.log( error );

  return (
    <main className='flex flex-col items-center justify-center h-full gap-6'>
      <h1 className='text-8xl font-bold'>{error.status}</h1>
      <p>{error.data}</p>
      <Link to="/" className='rounded-2xl mt-20 p-4 bg-highlight text-surface-muted hover:bg-surface-muted hover:text-highlight transition-colors duration-200' >Go back to Home</Link>
    </main>
  )
}