import React, { useEffect, useState } from "react";

export default function AdminQuizes() {
	const [quizzes, setQuizzes] = useState([]);
	const [modules, setModules] = useState([]);
	const [lessons, setLessons] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingLessons, setLoadingLessons] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const [form, setForm] = useState({
		title: "",
		description: "",
		selectedModule: "",
		lesson: "",
		questions: [
			{
				text: "",
				options: ["", ""],
				correctOption: 0,
				points: 1,
			},
		],
	});

	const apiBase = "http://localhost:3000";

	const fetchLessons = async (moduleId) => {
		if (!moduleId) {
			setLessons([]);
			return;
		}
		
		setLoadingLessons(true);
		try {
			const res = await fetch(`${apiBase}/api/lessons?moduleId=${moduleId}`, { mode: "cors" });
			const json = await res.json().catch(() => null);
			
			if (!res.ok) {
				throw new Error(json?.message || `Failed to fetch lessons (${res.status})`);
			}
			
			// Handle different response formats
			const lessonList = Array.isArray(json) ? json : (json?.data?.lessons || json?.lessons || []);
			setLessons(Array.isArray(lessonList) ? lessonList : []);
		} catch (err) {
			console.error("Failed to load lessons", err);
			setError("Failed to load lessons for selected module");
			setLessons([]);
		} finally {
			setLoadingLessons(false);
		}
	};

	const fetchModules = async () => {
		try {
			const res = await fetch(`${apiBase}/api/modules`, { mode: "cors" });
			const json = await res.json().catch(() => null);
			const list = json?.data?.modules || json || [];
			setModules(Array.isArray(list) ? list : []);
		} catch (err) {
			console.error("Failed to load modules", err);
		}
	};

	const fetchQuizzes = async () => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${apiBase}/api/quiz`, {
				method: "GET",
				mode: "cors",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
			});
			const json = await res.json().catch(() => null);
			if (!res.ok) throw new Error(json?.message || `Failed to fetch quizzes (${res.status})`);
			setQuizzes(Array.isArray(json) ? json : json.quizzes || json);
		} catch (err) {
			console.error("Fetch quizzes error:", err);
			setError("Failed to load quizzes");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchModules();
		fetchQuizzes();
	}, []);

	const handleField = (e) => {
		const { name, value } = e.target;
		
		// If module selection changes, reset lesson and fetch lessons for new module
		if (name === "selectedModule") {
			setForm({ 
				...form, 
				[name]: value, 
				lesson: "" // Reset lesson when module changes
			});
			fetchLessons(value);
		} else {
			setForm({ ...form, [name]: value });
		}
	};

	const addQuestion = () =>
		setForm({
			...form,
			questions: [
				...form.questions,
				{ text: "", options: ["", ""], correctOption: 0, points: 1 },
			],
		});

	const removeQuestion = (idx) =>
		setForm({
			...form,
			questions: form.questions.filter((_, i) => i !== idx),
		});

	const setQuestionText = (idx, value) => {
		const q = [...form.questions];
		q[idx].text = value;
		setForm({ ...form, questions: q });
	};

	const addOption = (qIdx) => {
		const q = [...form.questions];
		q[qIdx].options.push("");
		setForm({ ...form, questions: q });
	};

	const removeOption = (qIdx, oIdx) => {
		const q = [...form.questions];
		if (q[qIdx].options.length <= 2) return; // keep minimum 2 options
		q[qIdx].options.splice(oIdx, 1);
		if (q[qIdx].correctOption >= q[qIdx].options.length) q[qIdx].correctOption = 0;
		setForm({ ...form, questions: q });
	};

	const setOptionText = (qIdx, oIdx, value) => {
		const q = [...form.questions];
		q[qIdx].options[oIdx] = value;
		setForm({ ...form, questions: q });
	};

	const setCorrectOption = (qIdx, oIdx) => {
		const q = [...form.questions];
		q[qIdx].correctOption = Number(oIdx);
		setForm({ ...form, questions: q });
	};

	const setPoints = (qIdx, value) => {
		const q = [...form.questions];
		q[qIdx].points = Number(value) || 0;
		setForm({ ...form, questions: q });
	};

	const validateForm = () => {
		if (!form.title.trim()) return "Title is required";
		if (!form.selectedModule) return "Module is required";
		if (!form.lesson) return "Lesson is required";
		for (let i = 0; i < form.questions.length; i++) {
			const q = form.questions[i];
			if (!q.text.trim()) return `Question ${i + 1} text is required`;
			if (!Array.isArray(q.options) || q.options.length < 2) return `Question ${i + 1} needs at least 2 options`;
			if (!q.options[q.correctOption] || !q.options[q.correctOption].trim()) return `Question ${i + 1} correct option must be a valid option`;
		}
		return null;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		setSaving(true);
		try {
			const token = localStorage.getItem("token");
			const createdBy = localStorage.getItem("userId");
			const payload = {
				title: form.title,
				description: form.description,
				module: form.lesson, // Send lesson ID as module (since quiz model expects lesson reference)
				createdBy: createdBy || undefined,
				questions: form.questions.map((q) => ({
					text: q.text,
					options: q.options,
					correctOption: q.correctOption,
					points: q.points || 1,
				})),
			};

			const res = await fetch(`${apiBase}/api/quiz`, {
				method: "POST",
				mode: "cors",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify(payload),
			});

			const json = await res.json().catch(() => null);
			if (!res.ok) throw new Error(json?.message || `Failed to create quiz (${res.status})`);

			setSuccess(true);
			setForm({
				title: "",
				description: "",
				selectedModule: "",
				lesson: "",
				questions: [{ text: "", options: ["", ""], correctOption: 0, points: 1 }],
			});
			setLessons([]); // Clear lessons when form is reset
			await fetchQuizzes();
		} catch (err) {
			console.error("Create quiz error:", err);
			setError(err.message || "Failed to create quiz");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto mt-10 bg-white shadow-xl rounded-3xl p-8 border border-blue-200">
			<h2 className="text-2xl font-bold text-blue-700 text-center mb-6">📝 Create Quiz</h2>

			{error && <div className="mb-4 text-red-600 text-center font-semibold p-2 bg-red-50 rounded">{error}</div>}
			{success && <div className="mb-4 text-green-600 text-center font-semibold">Quiz created successfully!</div>}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
					<input name="title" value={form.title} onChange={handleField} required placeholder="Quiz title" className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring focus:ring-blue-300" />
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
					<textarea name="description" value={form.description} onChange={handleField} rows={2} placeholder="Optional description" className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring focus:ring-blue-300" />
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-600 mb-1">Module</label>
					<select 
						name="selectedModule" 
						value={form.selectedModule} 
						onChange={handleField} 
						required 
						className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring focus:ring-blue-300"
					>
						<option value="">Select module first</option>
						{modules.map((m) => (
							<option key={m._id} value={m._id}>
								{m.title}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-600 mb-1">
						Lesson
						{loadingLessons && <span className="text-blue-500 ml-2">(Loading...)</span>}
					</label>
					<select 
						name="lesson" 
						value={form.lesson} 
						onChange={handleField} 
						required 
						disabled={!form.selectedModule || loadingLessons}
						className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring focus:ring-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
					>
						<option value="">
							{!form.selectedModule 
								? "Select a module first" 
								: loadingLessons 
									? "Loading lessons..." 
									: lessons.length === 0 
										? "No lessons found for this module"
										: "Select lesson"
							}
						</option>
						{lessons.map((lesson) => (
							<option key={lesson._id} value={lesson._id}>
								{lesson.title}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-4">
					{form.questions.map((q, qi) => (
						<div key={qi} className="p-4 border border-blue-100 rounded-lg bg-blue-50">
							<div className="flex justify-between items-center mb-2">
								<span className="font-semibold">Question {qi + 1}</span>
								<div className="flex gap-2">
									{form.questions.length > 1 && <button type="button" onClick={() => removeQuestion(qi)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">Remove</button>}
								</div>
							</div>
							<input value={q.text} onChange={(e) => setQuestionText(qi, e.target.value)} placeholder="Question text" className="w-full px-3 py-2 border border-blue-300 rounded mb-2" />
							<div className="space-y-2">
								{q.options.map((opt, oi) => (
									<div key={oi} className="flex gap-2 items-center">
										<input type="radio" name={`correct-${qi}`} checked={q.correctOption === oi} onChange={() => setCorrectOption(qi, oi)} />
										<input value={opt} onChange={(e) => setOptionText(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} className="flex-1 px-3 py-2 border border-blue-300 rounded" />
										{q.options.length > 2 && <button type="button" onClick={() => removeOption(qi, oi)} className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded">X</button>}
									</div>
								))}
								<div className="flex gap-2 mt-2">
									<button type="button" onClick={() => addOption(qi)} className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded">Add Option</button>
									<div className="ml-auto flex items-center gap-2">
										<label className="text-sm text-gray-600">Points</label>
										<input type="number" value={q.points} onChange={(e) => setPoints(qi, e.target.value)} className="w-20 px-2 py-1 border rounded" />
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="flex gap-3">
					<button type="button" onClick={addQuestion} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Add Question</button>
					<button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60">{saving ? "Saving..." : "Create Quiz"}</button>
				</div>
			</form>

			{/* Quizzes list (read-only) */}
			<div className="mt-8 space-y-4">
				<h3 className="text-lg font-semibold">Existing Quizzes</h3>
				{loading && <div className="text-sm text-gray-500">Loading...</div>}
				{!loading && quizzes.length === 0 && <div className="text-sm text-gray-500">No quizzes.</div>}
				{!loading && quizzes.map((qz) => (
					<div key={qz._id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
						<div className="flex justify-between items-center">
							<div>
								<div className="font-semibold text-gray-800">{qz.title}</div>
								<div className="text-xs text-gray-500">
									Lesson: {qz.module?.title || "Unknown"}
									{qz.module?.module?.title && (
										<span className="ml-2">| Module: {qz.module.module.title}</span>
									)}
								</div>
								{qz.description && (
									<div className="text-xs text-gray-600 mt-1">{qz.description}</div>
								)}
								<div className="text-xs text-gray-500 mt-1">
									Questions: {qz.questions?.length || 0}
								</div>
							</div>
							<div className="text-xs text-gray-400">{new Date(qz.createdAt).toLocaleString()}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
