import PropTypes from 'prop-types';

function FiltroPedidos({ filtroActual, onCambiarFiltro, contadores }) {
  const filtros = [
    {
      id: 'todos',
      label: 'Todos',
      color: 'bg-gray-800 hover:bg-gray-900',
      activeColor: 'bg-gray-800 text-white',
      inactiveColor: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    },
    {
      id: 'pendiente',
      label: 'Pendientes',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      activeColor: 'bg-yellow-500 text-white',
      inactiveColor: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    },
    {
      id: 'en_preparacion',
      label: 'En Preparación',
      color: 'bg-blue-500 hover:bg-blue-600',
      activeColor: 'bg-blue-500 text-white',
      inactiveColor: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    },
    {
      id: 'completado',
      label: 'Listos',
      color: 'bg-green-500 hover:bg-green-600',
      activeColor: 'bg-green-500 text-white',
      inactiveColor: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filtros.map(filtro => {
        const isActive = filtroActual === filtro.id;
        const count = contadores[filtro.id] || 0;

        return (
          <button
            key={filtro.id}
            onClick={() => onCambiarFiltro(filtro.id)}
            className={`
              px-6 py-3 rounded-lg font-bold transition-all transform
              ${isActive ? filtro.activeColor : filtro.inactiveColor}
              ${isActive ? 'scale-105 shadow-lg' : 'shadow'}
              hover:scale-105
            `}
          >
            <span className="flex items-center gap-2">
              {filtro.label}
              <span className={`
                inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold
                ${isActive
                  ? 'bg-white bg-opacity-30'
                  : 'bg-gray-800 text-white'
                }
              `}>
                {count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

FiltroPedidos.propTypes = {
  filtroActual: PropTypes.string.isRequired,
  onCambiarFiltro: PropTypes.func.isRequired,
  contadores: PropTypes.shape({
    todos: PropTypes.number,
    pendiente: PropTypes.number,
    en_preparacion: PropTypes.number,
    completado: PropTypes.number
  }).isRequired
};

export default FiltroPedidos;
