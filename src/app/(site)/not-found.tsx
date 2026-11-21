import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container-rb max-w-xl text-center">
        <p className="font-display text-7xl font-extrabold text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-bold text-navy-800">Página não encontrada</h1>
        <p className="mt-2 text-mist-600">O conteúdo que você procura pode ter mudado de endereço.</p>
        <Link href="/" className="btn-dark mt-8">Voltar ao início</Link>
      </div>
    </section>
  );
}
