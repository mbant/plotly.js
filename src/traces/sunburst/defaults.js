'use strict';

var Lib = require('../../lib');
var attributes = require('./attributes');
var handleDomainDefaults = require('../../plots/domain').defaults;
var handleText = require('../bar/defaults').handleText;
var coercePattern = require('../../lib').coercePattern;

var Colorscale = require('../../components/colorscale');
var hasColorscale = Colorscale.hasColorscale;
var colorscaleDefaults = Colorscale.handleDefaults;

module.exports = function supplyDefaults(traceIn, traceOut, defaultColor, layout) {
    function coerce(attr, dflt) {
        return Lib.coerce(traceIn, traceOut, attributes, attr, dflt);
    }

    var labels = coerce('labels');
    var parents = coerce('parents');

    if(!labels || !labels.length || !parents || !parents.length) {
        traceOut.visible = false;
        return;
    }

    var vals = coerce('values');
    if(vals && vals.length) {
        coerce('branchvalues');
    } else {
        coerce('count');
    }

    coerce('level');
    coerce('maxdepth');

    var lineWidth = coerce('marker.line.width');
    if(lineWidth) coerce('marker.line.color', layout.paper_bgcolor);

    var markerColors = coerce('marker.colors');
    coercePattern(coerce, 'marker.pattern', markerColors);
    // push the marker colors (with s) to the foreground colors, to work around logic in the drawing pattern code on marker.color (without s, which is okay for a bar trace)
    if(traceIn.marker && !traceOut.marker.pattern.fgcolor) traceOut.marker.pattern.fgcolor = traceIn.marker.colors;
    if(!traceOut.marker.pattern.bgcolor) traceOut.marker.pattern.bgcolor = layout.paper_bgcolor;

    var withColorscale = traceOut._hasColorscale = (
        hasColorscale(traceIn, 'marker', 'colors') ||
        (traceIn.marker || {}).coloraxis // N.B. special logic to consider "values" colorscales
    );
    if(withColorscale) {
        colorscaleDefaults(traceIn, traceOut, layout, coerce, {prefix: 'marker.', cLetter: 'c'});
    }

    coerce('leaf.opacity', withColorscale ? 1 : 0.7);

    var text = coerce('text');
    coerce('texttemplate');
    if(!traceOut.texttemplate) coerce('textinfo', Array.isArray(text) ? 'text+label' : 'label');

    coerce('hovertext');
    coerce('hovertemplate');

    var textposition = 'auto';
    handleText(traceIn, traceOut, layout, coerce, textposition, {
        moduleHasSelected: false,
        moduleHasUnselected: false,
        moduleHasConstrain: false,
        moduleHasCliponaxis: false,
        moduleHasTextangle: false,
        moduleHasInsideanchor: false
    });

    coerce('insidetextorientation');

    coerce('sort');

    coerce('rotation');

    coerce('root.color');

    handleDomainDefaults(traceOut, layout, coerce);

    // do not support transforms for now
    traceOut._length = null;
};
