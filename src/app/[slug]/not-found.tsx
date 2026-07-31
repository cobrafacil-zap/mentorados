export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white px-4 text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">Página não encontrada</h1>
        <p className="text-lg text-gray-300">
          Esse mentorado não existe ou a página foi desativada.
        </p>
      </div>
    </div>
  );
}
