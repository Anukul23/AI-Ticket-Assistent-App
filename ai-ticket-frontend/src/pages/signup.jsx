import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/ToastContext.jsx";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "user",
    skills: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const availableSkills = [
    "React", "JavaScript", "Node.js", "MongoDB", "CSS", "HTML",
    "API", "Frontend", "Backend", "DevOps", "Database", "Python",
    "Java", "C++", "PHP", "Ruby", "Go", "Rust", "Docker", "Kubernetes"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showSuccess("Account created successfully! Welcome to the platform.");
        navigate("/");
      } else {
        showError(data.message || data.error || "Signup failed");
      }
    } catch (err) {
      showError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <form onSubmit={handleSignup} className="card-body">
          <h2 className="card-title justify-center">Sign Up</h2>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input input-bordered"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input input-bordered"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div className="form-control">
            <label className="label">
              <span className="label-text">Role</span>
            </label>
            <select
              name="role"
              className="select select-bordered"
              value={form.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Skills (Select multiple)</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {availableSkills.map((skill) => (
                <label key={skill} className="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm mr-2"
                    checked={form.skills.includes(skill)}
                    onChange={() => handleSkillChange(skill)}
                  />
                  <span className="label-text text-xs">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-control mt-4">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
