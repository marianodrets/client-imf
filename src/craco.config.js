module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            return webpackConfig;
        }
    },
    devServer: {
        setupMiddlewares: (middlewares, devServer) => {
            // Aquí puedes agregar tus middlewares personalizados si es necesario.
            return middlewares;
        }
    }
};
