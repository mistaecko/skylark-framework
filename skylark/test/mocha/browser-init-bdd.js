//mocha.setup('bdd');
mocha.setup({
    ui: 'bdd',
    ignoreLeaks: true,
    bail: false
});

// in a browser environment, sinonChai will register itself with chai by default anyway
//chai.use(sinonChai);