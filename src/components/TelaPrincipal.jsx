import { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";

export default function TelaPrincipal() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    valor: "",
    quantidade: "",
    categoria: "COMIDA",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyerData, setBuyerData] = useState({
    name: "",
    cpf: "",
    paymentMethod: "DINHEIRO",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);

  const API_URL = "http://localhost:8080/produto";
  const SALE_API_URL = "http://localhost:8080/venda";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(API_URL);
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setErrorMessage("Erro ao carregar produtos");
    }
  };

  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  const handleAddToCart = (product) => {
    const existing = cart.find((item) => item.idProduto === product.idProduto);

    if (existing) {
      if (existing.cartQuantity + 1 > product.quantidade) {
        setErrorMessage(
          `Quantidade indisponível. Estoque restante: ${
            product.quantidade - existing.cartQuantity
          }`
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.idProduto === product.idProduto
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        )
      );
    } else {
      if (product.quantidade < 1) {
        setErrorMessage("Produto sem estoque disponível");
        return;
      }
      setCart([...cart, { ...product, cartQuantity: 1, itemDiscount: 0 }]);
    }
    setErrorMessage("");
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter((item) => item.idProduto !== id));
  };

  const handleUpdateCartItem = (id, field, value) => {
    setCart(
      cart.map((item) =>
        item.idProduto === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProducts(products.filter((product) => product.idProduto !== id));
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      setErrorMessage("Erro ao remover produto");
    }
  };

  const handleAddProductClick = () => {
    setFormData({
      nome: "",
      valor: "",
      quantidade: "",
      categoria: "COMIDA",
    });
    setShowAddModal(true);
  };

  const handleCreateProduct = async () => {
    if (!formData.nome || !formData.valor || !formData.quantidade) {
      setErrorMessage("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const productData = {
        nome: formData.nome,
        valor: parseFloat(formData.valor.replace(",", ".")),
        quantidade: parseInt(formData.quantidade),
        categoria: formData.categoria,
      };

      const response = await axios.post(API_URL, productData);
      setProducts([...products, response.data]);
      setShowAddModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      setErrorMessage("Erro ao criar produto");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      nome: product.nome,
      valor: product.valor.toString().replace(".", ","),
      quantidade: product.quantidade.toString(),
      categoria: product.categoria,
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const updatedProduct = {
        nome: formData.nome,
        valor: parseFloat(formData.valor.replace(",", ".")),
        quantidade: parseInt(formData.quantidade),
        categoria: formData.categoria,
      };

      const response = await axios.put(
        `${API_URL}/${editingProduct.idProduto}`,
        updatedProduct
      );

      const updatedProducts = products.map((product) =>
        product.idProduto === editingProduct.idProduto ? response.data : product
      );

      setProducts(updatedProducts);
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      setErrorMessage("Erro ao atualizar produto");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleBuyerChange = (e) => {
    const { name, value } = e.target;
    setBuyerData({
      ...buyerData,
      [name]: value,
    });
  };

  const handleOpenBuyModal = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(SALE_API_URL);
      setCurrentSaleId(response.data.idVenda);

      setBuyerData({
        name: "",
        cpf: "",
        paymentMethod: "DINHEIRO",
      });
      setShowBuyModal(true);
    } catch (error) {
      console.error("Erro ao iniciar venda:", error);
      setErrorMessage("Erro ao iniciar o processo de venda");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateItemTotal = (item) => {
    const discountValue = item.valor * (item.itemDiscount / 100);
    const discountedPrice = item.valor - discountValue;
    return discountedPrice * item.cartQuantity;
  };
  const handleConfirmBuy = async () => {
    if (!buyerData.name || !buyerData.cpf) {
      setErrorMessage("Preencha todos os campos obrigatórios");
      return;
    }

    if (!currentSaleId) {
      setErrorMessage("Erro no processo de venda. Tente novamente.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const vendaDTO = {
        idVenda: currentSaleId,
        cpfCliente: buyerData.cpf,
        formaPagamento: buyerData.paymentMethod.toLowerCase(),
        vendas: cart.map((item) => ({
          nome: item.nome,
          quantidade: item.cartQuantity,
          valor: item.valor,
          desconto: item.itemDiscount,
        })),
      };

      const response = await axios.post(
        `${SALE_API_URL}/finalizar/${currentSaleId}`,
        vendaDTO.vendas,
        {
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      await Promise.all(
        cart.map(async (item) => {
          const updatedProduct = {
            nome: item.nome,
            valor: item.valor,
            quantidade: item.quantidade - item.cartQuantity,
            categoria: item.categoria,
          };
          await axios.put(`${API_URL}/${item.idProduto}`, updatedProduct);
        })
      );

      await fetchProducts();
      setCart([]);
      setShowBuyModal(false);
      setCurrentSaleId(null);
    } catch (error) {
      console.error("Erro ao finalizar compra:", error);
      setErrorMessage(
        "Erro ao finalizar compra. Verifique os dados e tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.nome.toLowerCase().includes(search.toLowerCase())
  );

  const cartTotal = cart.reduce(
    (acc, item) => acc + calculateItemTotal(item),
    0
  );

  const paymentMethods = [
    { value: "DINHEIRO", label: "Dinheiro" },
    { value: "CREDITO", label: "Cartão de Crédito" },
    { value: "DEBITO", label: "Cartão de Débito" },
    { value: "PIX", label: "PIX" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Produtos Disponíveis</h2>
              <button
                onClick={handleAddProductClick}
                className="px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-500 transition-colors"
              >
                + Adicionar Produto
              </button>
            </div>

            <input
              type="text"
              placeholder="Pesquisar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <hr className="my-4" />

            {errorMessage && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            <div className="space-y-4 h-[360px] overflow-y-auto pr-2">
              {filteredProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {search
                    ? "Nenhum produto encontrado"
                    : "Nenhum produto cadastrado"}
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.idProduto}
                    className="border p-4 rounded-lg flex flex-col gap-2 md:flex-row md:items-center md:justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.nome}</h3>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <p>Preço: {formatPrice(product.valor)}</p>
                        <p>Estoque: {product.quantidade}</p>
                        <p>Categoria: {product.categoria}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center mt-2 md:mt-0">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleRemoveProduct(product.idProduto)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Remover
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                        disabled={product.quantidade < 1}
                      >
                        {product.quantidade < 1
                          ? "Sem estoque"
                          : "Add Carrinho"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="w-full md:w-1/3 bg-white p-4 rounded-2xl shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Carrinho</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum produto no carrinho.
              </p>
            ) : (
              <>
                <div className="space-y-4 h-[300px] overflow-y-auto pr-2 flex-grow">
                  {cart.map((item) => (
                    <div
                      key={item.idProduto}
                      className="border p-3 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.nome}</h3>
                          <p>Preço unitário: {formatPrice(item.valor)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.idProduto)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors"
                        >
                          Remover
                        </button>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Quantidade
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={item.quantidade}
                            value={item.cartQuantity}
                            onChange={(e) =>
                              handleUpdateCartItem(
                                item.idProduto,
                                "cartQuantity",
                                Math.max(
                                  1,
                                  Math.min(
                                    item.quantidade,
                                    parseInt(e.target.value) || 1
                                  )
                                )
                              )
                            }
                            className="w-full p-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Desconto (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.itemDiscount}
                            onChange={(e) =>
                              handleUpdateCartItem(
                                item.idProduto,
                                "itemDiscount",
                                Math.max(
                                  0,
                                  Math.min(100, parseInt(e.target.value) || 0)
                                )
                              )
                            }
                            className="w-full p-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="font-medium">
                          Subtotal: {formatPrice(calculateItemTotal(item))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t pt-3">
                  <p className="text-lg font-semibold">
                    Total: {formatPrice(cartTotal)}
                  </p>
                  <button
                    onClick={handleOpenBuyModal}
                    disabled={cart.length === 0 || isLoading}
                    className="w-full py-3 bg-green-500 text-white rounded-md text-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Processando..." : "Finalizar Compra"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">
              Adicionar Novo Produto
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Valor
                </label>
                <input
                  type="text"
                  name="valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantidade
                </label>
                <input
                  type="number"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="COMIDA">COMIDA</option>
                  <option value="BEBIDA">BEBIDA</option>
                  <option value="LIMPEZA">LIMPEZA</option>
                  <option value="HIEIENE">HIGIENE</option>
                </select>
              </div>
            </div>
            {errorMessage && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Editar Produto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Valor
                </label>
                <input
                  type="text"
                  name="valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantidade
                </label>
                <input
                  type="number"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="COMIDA">COMIDA</option>
                  <option value="BEBIDA">BEBIDA</option>
                  <option value="LIMPEZA">LIMPEZA</option>
                  <option value="HIGIENE">HIGIENE</option>
                </select>
              </div>
            </div>
            {errorMessage && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
      {showBuyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Finalizar Compra</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  name="name"
                  value={buyerData.name}
                  onChange={handleBuyerChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CPF do Cliente
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={buyerData.cpf}
                  onChange={handleBuyerChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Forma de Pagamento
                </label>
                <select
                  name="paymentMethod"
                  value={buyerData.paymentMethod}
                  onChange={handleBuyerChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {errorMessage && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowBuyModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBuy}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Processando..." : "Confirmar Compra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
