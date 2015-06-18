var fs = require('fs');
var nn = require('../js/init.js')
var ndarray = require("ndarray")
var assert = require("assert")
var eps = 1e-5

function testSpatialConvolution() {
    var data = JSON.parse(fs.readFileSync('data/conv.json', 'utf8'));
    var weight = ndarray(data.weight, [data.op, data.ip, data.kH, data.kW]);
    var bias = ndarray(data.bias, [data.op]);
    var mod = new nn.SpatialConvolution(weight, bias);
    var oH = data.iH - data.kH + 1;
    var oW = data.iW - data.kW + 1;
    var gt = ndarray(data.out, [data.op, oH, oW])
    var inp = ndarray(data.inp, [data.ip, data.iH, data.iW])
    var out = mod.forward(inp)
    var err = 0;
    for (i=0; i < data.op; i++) {
	for (j=0; j < oH; j++) {
	    for (k=0; k < oW; k++) {
		err = Math.max(err, Math.abs(out.get(i,j,k) - gt.get(i,j,k)));
	    }
	}
    }
    assert.equal(true, err <= eps, "Convolution test failed. Error: " + err)
}

describe('SpatialConvolution', function() {
    it('Should compare against torch convolutions', testSpatialConvolution)
});

function testSpatialMaxPooling() {
    var data = JSON.parse(fs.readFileSync('data/pool.json', 'utf8'));
    var mod = new nn.SpatialMaxPooling(data.kH, data.kW, data.dH, data.dW);
    var oH = Math.floor((data.iH - data.kH) / data.dH + 1);
    var oW = Math.floor((data.iW - data.kW) / data.dW + 1);
    var gt = ndarray(data.out, [data.np, oH, oW])
    var inp = ndarray(data.inp, [data.np, data.iH, data.iW])
    var out = mod.forward(inp)
    var err = 0;
    for (i=0; i < data.np; i++) {
	for (j=0; j < oH; j++) {
	    for (k=0; k < oW; k++) {
		err = Math.max(err, Math.abs(out.get(i,j,k) - gt.get(i,j,k)));
	    }
	}
    }
    assert.equal(true, err <= eps, "MaxPooling test failed. Error: " + err)
}

describe('SpatialMaxPooling', function() {
    it('Should compare against torch SpatialMaxPooling', testSpatialMaxPooling)
});

function testSpatialMaxPoolingHWD() {
    var data = JSON.parse(fs.readFileSync('data/pool.json', 'utf8'));
    var mod = new nn.SpatialMaxPoolingHWD(data.kH, data.kW, data.dH, data.dW);
    var oH = Math.floor((data.iH - data.kH) / data.dH + 1);
    var oW = Math.floor((data.iW - data.kW) / data.dW + 1);
    var gt = ndarray(data.outHWD, [oH, oW, data.np])
    var inp = ndarray(data.inpHWD, [data.iH, data.iW, data.np])
    var out = mod.forward(inp)
    var err = 0;
    for (i=0; i < data.np; i++) {
	for (j=0; j < oH; j++) {
	    for (k=0; k < oW; k++) {
		err = Math.max(err, Math.abs(out.get(j,k,i) - gt.get(j,k,i)));
              assert(err <= eps, i + " " + j + " " + k + " " + gt.get(j,k,i) + " vs " + out.get(j,k,i))
	    }
	}
    }
    assert.equal(true, err <= eps, "MaxPoolingHWD test failed. Error: " + err)
}

describe('SpatialMaxPoolingHWD', function() {
    it('Should compare against torch SpatialMaxPooling with transposed HWD layout', testSpatialMaxPoolingHWD)
});

function testLinear() {
    var data = JSON.parse(fs.readFileSync('data/full.json', 'utf8'));
    var weight = ndarray(data.weight, [data.outSize, data.inSize]);
    var bias = ndarray(data.bias, [data.outSize]);
    var mod = new nn.Linear(weight, bias);
    var gt = ndarray(data.out, [data.outSize])
    var inp = ndarray(data.inp, [data.inSize])
    var out = mod.forward(inp)
    var err = 0;
    for (i=0; i < data.outSize; i++) {
	err = Math.max(err, Math.abs(out.get(i) - gt.get(i)));
    }
    assert.equal(true, err <= eps, "Linear test failed. Error: " + err)
}

describe('Linear', function() {
    it('Should compare against torch Linear layer', testLinear)
});
