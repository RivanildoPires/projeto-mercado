import { useState } from "react";
import Header from "./Header";

export default function TelaPrincipal() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [addQuantity, setAddQuantity] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyerData, setBuyerData] = useState({
    name: "",
    cpf: "",
    discount: "",
  });

  const formatPrice = (price) => {
    return `R$:${price.toFixed(2).replace(".", ",")}`;
  };

  const handleAddToCart = (product) => {
    const quantity = parseInt(addQuantity[product.id]) || 1;
    if (quantity > product.quantity) {
      setErrorMessage(
        `Quantidade indisponível. Estoque atual: ${product.quantity}`
      );
      return;
    }
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.cartQuantity + quantity > product.quantity) {
        setErrorMessage(
          `Quantidade indisponível. Você já tem ${existing.cartQuantity} no carrinho. Estoque restante: ${
            product.quantity - existing.cartQuantity
          }`
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, cartQuantity: quantity }]);
    }
    setErrorMessage("");
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleRemoveProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const handleAddProductClick = () => {
    setFormData({
      name: "",
      price: "",
      quantity: "",
    });
    setShowAddModal(true);
  };

  const handleCreateProduct = () => {
    if (!formData.name || !formData.price || !formData.quantity) {
      setErrorMessage("Preencha todos os campos");
      return;
    }
    const newProduct = {
      id: Date.now(),
      name: formData.name,
      price: parseFloat(formData.price.replace(",", ".")),
      quantity: parseInt(formData.quantity),
    };
    setProducts([...products, newProduct]);
    setShowAddModal(false);
    setErrorMessage("");
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString().replace(".", ","),
      quantity: product.quantity.toString(),
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    const updatedProduct = {
      ...formData,
      price: parseFloat(formData.price.replace(",", ".")),
      quantity: parseInt(formData.quantity),
    };
    const updatedProducts = products.map((product) =>
      product.id === editingProduct.id
        ? { ...product, ...updatedProduct }
        : product
    );
    setProducts(updatedProducts);
    setShowEditModal(false);
    setEditingProduct(null);
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

  const handleOpenBuyModal = () => {
    setBuyerData({
      name: "",
      cpf: "",
      discount: "",
    });
    setShowBuyModal(true);
  };

  const handleConfirmBuy = () => {
    const discount = parseFloat(buyerData.discount) || 0;
    const updatedProducts = products.map((product) => {
      const cartItem = cart.find((item) => item.id === product.id);
      if (cartItem) {
        return {
          ...product,
          quantity: product.quantity - cartItem.cartQuantity,
        };
      }
      return product;
    });
    setProducts(updatedProducts);
    setShowBuyModal(false);
    alert(
      `Compra realizada com sucesso!\nNome: ${buyerData.name}\nCPF: ${buyerData.cpf}`
    );
    setCart([]);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.cartQuantity,
    0
  );

  const totalWithDiscount = total - (total * (parseFloat(buyerData.discount) || 0)) / 100;

  return (
    <div>
      <Header />
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Produtos Disponíveis</h2>
            <input
              type="text"
              placeholder="Pesquisar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />
            <hr className="my-4" />
            {errorMessage && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            <div className="space-y-4 h-[360px] overflow-y-auto pr-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border p-4 rounded-lg flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p>Preço: {formatPrice(product.price)}</p>
                    <p>Estoque: {product.quantity}</p>
                  </div>
                  <div className="flex gap-2 items-center mt-2 md:mt-0">
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      className="w-20 p-1 border rounded-md"
                      value={addQuantity[product.id] || ""}
                      placeholder="Qtd"
                      onChange={(e) =>
                        setAddQuantity({
                          ...addQuantity,
                          [product.id]: e.target.value,
                        })
                      }
                      onWheel={(e) => e.target.blur()}
                    />
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddProductClick}
              className="mt-6 w-full p-2 border rounded-md bg-amber-300 hover:bg-amber-400"
            >
              Adicionar Produto
            </button>
          </div>

          <div className="w-full md:w-1/3 bg-white p-4 rounded-2xl shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Carrinho</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">Nenhum produto no carrinho.</p>
            ) : (
              <>
                <div className="space-y-4 h-[300px] overflow-y-auto pr-2 flex-grow">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="border p-3 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p>
                          Qtd: {item.cartQuantity} |{" "}
                          {formatPrice(item.price * item.cartQuantity)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <p className="font-semibold">
                    Total: {formatPrice(total)}
                  </p>
                </div>
                <button
                  onClick={handleOpenBuyModal}
                  className="w-full mt-4 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                >
                  Comprar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <Modal
          title="Editar Produto"
          formData={formData}
          errorMessage={errorMessage}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateProduct}
          onChange={handleInputChange}
        />
      )}

      {showAddModal && (
        <Modal
          title="Adicionar Novo Produto"
          formData={formData}
          errorMessage={errorMessage}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateProduct}
          onChange={handleInputChange}
        />
      )}

      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Finalizar Compra</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={buyerData.name}
                  onChange={handleBuyerChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={buyerData.cpf}
                  onChange={handleBuyerChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  % Desconto
                </label>
                <input
                  type="number"
                  name="discount"
                  value={buyerData.discount}
                  onChange={handleBuyerChange}
                  className="w-full p-2 border rounded-md"
                  onWheel={(e) => e.target.blur()}
                />
              </div>
              <p>
                Total com desconto:{" "}
                <span className="font-semibold">
                  {formatPrice(totalWithDiscount)}
                </span>
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowBuyModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBuy}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ title, formData, errorMessage, onClose, onSubmit, onChange }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preço</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={onChange}
              className="w-full p-2 border rounded-md"
              onWheel={(e) => e.target.blur()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantidade</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={onChange}
              className="w-full p-2 border rounded-md"
              onWheel={(e) => e.target.blur()}
            />
          </div>
        </div>
        {errorMessage && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
