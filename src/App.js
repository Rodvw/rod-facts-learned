import { useEffect, useState } from 'react';
import './style.css';
import supabase from './supabase';

const CATEGORIES = [
	{ name: 'technology', color: '#3b82f6' },
	{ name: 'science', color: '#16a34a' },
	{ name: 'finance', color: '#ef4444' },
	{ name: 'society', color: '#eab308' },
	{ name: 'entertainment', color: '#db2777' },
	{ name: 'health', color: '#14b8a6' },
	{ name: 'history', color: '#f97316' },
	{ name: 'news', color: '#8b5cf6' },
];

function App() {
	// 1. define state variable
	const [showForm, setShowForm] = useState(false); // render del form como state, parte falso pero si presionas boton, lo renderiza
	const [facts, setFacts] = useState([]); // estado para hacer los facts, donde tiene estado inicial para partir lel factlist, pero ademas el setfacts para dibujar nuevos, es una funcion del form.
	const [isLoading, setIsLoading] = useState(true); // estado para el loader
	const [currentCategory, setCurrentCategory] = useState('all'); // estado para las categorias y su uso en el filtro, cambia con los onclick

	// aqui la main query de la base de datos
	useEffect(() => {
		async function getFacts() {
			setIsLoading(true);
			// se deconstruye la query de la base de datos
			let query = supabase.from('facts').select('*');
			// comprobamos el state all para filtrar por categoria
			if (currentCategory !== 'all') {
				query = query.eq('category', currentCategory);
			}
			// luego se continua como siempre el resto de la query.
			const { data: facts, error } = await query
				.order('votesInteresting', { ascending: false })
				.limit(1000);
			console.log(error);
			setFacts(facts);
			setIsLoading(false);
		}
		getFacts();
	}, [currentCategory]); // el arreglo final es de dependencias, en blanco para cuando se tenga que hacer refecth en el useEffect, no cargue los datos de nuevo. Ahora si colocamos currentCategory que es el que se actualiza en cada click. SE EJECUTA CADA VEZ QUE CAMBIE EL CURRENTCAT

	return (
		<>
			<Header showForm={showForm} setShowForm={setShowForm} />
			{/* pasamos el state variables a la funcion Heeader para renderizar */}
			{/* <Counter /> */}
			{/*2.  Use state de varias variables, si showform esta en true, renderiza el form y con la capacidad de hacer setFacts que es del otro useState, mezcla los 2 */}
			{showForm ? (
				<NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
			) : null}

			<main className="main">
				<CategoryFilter setCurrentCategory={setCurrentCategory} />
				{isLoading ? (
					<Loader />
				) : (
					<FactList facts={facts} setFacts={setFacts} />
				)}
			</main>
		</>
	);
}

function Loader() {
	return <p className="message">Loading....</p>;
}

// Render de Header recibe el props setShowForm deconstruido del componente Header
function Header({ showForm, setShowForm }) {
	const appTitle = 'Rod Querys SupaBase / React';
	return (
		<header className="header">
			<div className="logo">
				<img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
				<h1>{appTitle}</h1>
			</div>

			<button
				className="btn btn-large btn-open"
				// 3. update state variable
				onClick={() => setShowForm((show) => !show)}
			>
				{showForm ? 'Close' : 'Share a fact'}
			</button>
		</header>
	);
}

function isValidHttpUrl(str) {
	let url;
	try {
		url = new URL(str);
	} catch (_) {
		return false;
	}
	return url.protocol === 'http:' || url.protocol === 'https:';
}

function NewFactForm({ setFacts, setShowForm }) {
	// eficiones para el contenido del form, siendo text el valor del input field pero esta en 0 por el usestate, se lo agregamos como value en el input
	// notar que para que se haga el update de valor, se usa setText, cambia el state mediante la funcion onChange.
	// e.target.value le lo que se escribio en el input del form y se cambia por el text definido en el useState

	const [text, setText] = useState('');
	const [source, setSource] = useState('');
	const [category, setCategory] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const textLenght = text.length;

	async function handleSubmit(e) {
		// 1. prevent  browser reload
		e.preventDefault();
		console.log(text, source, category);

		// 2. Check if data is valid. If so, create new fact
		if (text && isValidHttpUrl(source) && category && textLenght <= 200) {
			// 3. Create a new fact Object
			// const newFact = {
			// 	id: Math.round(Math.random() * 10000),
			// 	text,
			// 	source, // notar que esto es igual que source: source,
			// 	category,
			// 	votesInteresting: 0,
			// 	votesMindblowing: 0,
			// 	votesFalse: 0,
			// 	createdIn: new Date().getFullYear(),
			// };

			// 3. Real update to supabase and receive new fact object
			setIsUploading(true);
			const { data: newFact, error } = await supabase
				.from('facts')
				.insert([
					{
						text,
						source,
						category,
					},
				])
				.select();
			setIsUploading(false);
			// 4. Add the new fact to the UI: add the fact to the state.
			if (!error) setFacts((facts) => [newFact[0], ...facts]); // facts es el arreglo, lo metemos en el arreglo nuevo dondee se le pone primero el nuevo fact, y se renderea con setFacts, [agregamos el nuevo fact, no todos los demas]
			//5. Reset input fields
			setText('');
			setSource('');
			setCategory('');
			//6. Close the form
			// setShowForm(false);
		}
	}

	return (
		<form className="fact-form" onSubmit={handleSubmit}>
			<input
				value={text}
				type="text"
				placeholder="Share a fact with the world..."
				onChange={(e) => setText(e.target.value)}
				disabled={isUploading}
			/>
			<span>{200 - textLenght}</span>
			<input
				value={source}
				type="text"
				placeholder="Trustworthy source..."
				onChange={(e) => setSource(e.target.value)}
				disabled={isUploading}
			/>
			<select
				value={category}
				onChange={(e) => setCategory(e.target.value)}
				disabled={isUploading}
			>
				<option value="">Choose category:</option>
				{/* mapeamos el arreglo para el listado de categorias en el selector */}
				{CATEGORIES.map((cat) => (
					<option key={cat.name} value={cat.name}>
						{cat.name.toUpperCase()}
					</option>
				))}
			</select>
			<button className="btn btn-large" disabled={isUploading}>
				Post
			</button>
		</form>
	);
}

function CategoryFilter({ setCurrentCategory }) {
	return (
		<aside>
			<li className="category">
				<button
					className="btn btn-all-categories"
					onClick={() => setCurrentCategory('all')}
				>
					All
				</button>
			</li>

			<ul>
				{CATEGORIES.map((cat) => (
					<li
						key={cat.name}
						className="category"
						onClick={() => setCurrentCategory(cat.name)}
					>
						<button
							className="btn btn-category"
							style={{
								backgroundColor: cat.color,
							}}
						>
							{cat.name}
						</button>
					</li>
				))}
			</ul>
		</aside>
	);
}

// Listado de los facts
function FactList({ facts, setFacts }) {
	if (facts.length === 0) return <p className="message">No facts found 👾 </p>;

	return (
		<section>
			<ul className="facts-list">
				{facts.map((fact) => (
					<Fact key={fact.id} fact={fact} setFacts={setFacts} /> // aqui pasamos la key y el objeto a child component
				))}
			</ul>
			<p>There are {facts.length} facts in the database. Add your own!</p>
		</section>
	);
}

// Render de los facts
function Fact({ fact, setFacts }) {
	const [isUpdating, setIsUpdating] = useState(false);
	const isDisputed =
		fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;
	// aqui recibe el objeto del parent, para renderizarlo
	//const { factObj } = props; // destructuring props factObjt = props.factObj

	// este handler se ejecuta cuando se hace click en el boton de vote y toma de facts, el fact con id del boton presionado, y le hace update sumando 1.
	//si no hay error,
	async function handleVote(columName) {
		setIsUpdating(true);
		const { data: updatedFact, error } = await supabase
			.from('facts')
			.update({ [columName]: fact[columName] + 1 })
			.eq('id', fact.id)
			.select(); // select ayuda al update en el local

		setIsUpdating(false);
		// para el render mapeas todo el arreglo, luego en el que el id del boton presionado sea igual al de factlist, se pone el updated, si no, el viejo como simepre para todos.
		if (!error)
			setFacts((facts) =>
				facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
			);
	}

	return (
		<li className="fact">
			<p>
				{isDisputed ? <span className={'disputed'}>[💥DISPUTED🤖]</span> : null}
				{fact.text}
				<a
					className="source"
					href={fact.source}
					target="_blank"
					rel="noreferrer"
				>
					(Source)
				</a>
			</p>
			<span
				className="tag"
				style={{
					backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
						.color,
				}}
			>
				{fact.category}
			</span>
			<div className="vote-buttons">
				<button
					onClick={() => handleVote('votesInteresting')}
					disabled={isUpdating}
				>
					👍 {fact.votesInteresting}
				</button>
				<button
					onClick={() => handleVote('votesMindblowing')}
					disabled={isUpdating}
				>
					🤯 {fact.votesMindblowing}
				</button>
				<button onClick={() => handleVote('votesFalse')} disabled={isUpdating}>
					⛔️ {fact.votesFalse}
				</button>
			</div>
		</li>
	);
}

export default App;
