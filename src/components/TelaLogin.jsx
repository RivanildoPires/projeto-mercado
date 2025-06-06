import "./TelaLogin.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TelaLogin = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/login', {
        login: login,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/telaPrincipal');
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Credenciais inválidas');
      } else if (err.request) {
        setError('Servidor não respondeu. Tente novamente mais tarde.');
      } else {
        setError('Erro ao configurar a requisição.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-diagonal-gradient h-screen w-full">
      <div className="container-box">
        <div className="form-container">
          <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <img
                alt="Your Company"
                src="./src/assets/mercado.png"
                className="mx-auto h-25 w-auto"
              />
              <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                Entre com sua conta
              </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="login"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Login
                  </label>
                  <div className="mt-2">
                    <input
                      id="login"
                      name="login"
                      type="text"
                      required
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      autoComplete="username"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-400 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Senha
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-400 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-md bg-amber-400 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelaLogin;