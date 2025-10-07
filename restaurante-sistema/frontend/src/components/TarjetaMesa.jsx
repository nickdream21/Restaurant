import PropTypes from 'prop-types';

function TarjetaMesa({ mesa, onClick }) {
  const esDisponible = mesa.estado === 'disponible';
  const esOcupada = mesa.estado === 'ocupada';

  return (
    <div
      onClick={onClick}
      className={`
        p-6 rounded-lg shadow-md cursor-pointer transition-all hover:shadow-xl
        ${esDisponible ? 'bg-green-100 border-2 border-green-500' : ''}
        ${esOcupada ? 'bg-red-100 border-2 border-red-500' : ''}
        ${mesa.estado === 'reservada' ? 'bg-yellow-100 border-2 border-yellow-500' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-2xl font-bold text-gray-800">
          Mesa {mesa.numero}
        </h3>
        <span
          className={`
            px-3 py-1 rounded-full text-sm font-semibold
            ${esDisponible ? 'bg-green-500 text-white' : ''}
            ${esOcupada ? 'bg-red-500 text-white' : ''}
            ${mesa.estado === 'reservada' ? 'bg-yellow-500 text-white' : ''}
          `}
        >
          {mesa.estado === 'disponible' ? 'Libre' :
           mesa.estado === 'ocupada' ? 'Ocupada' : 'Reservada'}
        </span>
      </div>

      {esOcupada && (
        <div className="mt-4 pt-4 border-t border-red-300">
          <p className="text-sm text-gray-600 mb-1">Total actual:</p>
          <p className="text-2xl font-bold text-red-700">
            ${mesa.total_actual ? mesa.total_actual.toFixed(2) : '0.00'}
          </p>
        </div>
      )}

      {esDisponible && (
        <p className="text-sm text-gray-500 mt-4">
          Click para abrir mesa
        </p>
      )}
    </div>
  );
}

TarjetaMesa.propTypes = {
  mesa: PropTypes.shape({
    id: PropTypes.number.isRequired,
    numero: PropTypes.number.isRequired,
    estado: PropTypes.string.isRequired,
    total_actual: PropTypes.number
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

export default TarjetaMesa;
