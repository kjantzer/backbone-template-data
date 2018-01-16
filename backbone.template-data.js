(function(){

	// add .templateData() method to all Models
	Backbone.Model.prototype.templateData = function(){ return this.toTemplateData() } // ! DEPRECATED

	Backbone.Model.prototype.toTemplateData = function(){

	    var that = this;
	    var data = this.toJSON();

	    // for each attribute, look for models and collections to convert
	    _.each(this.attributes, function(attr, key){
			
			if( that.attrTypes && that.attrTypes[key] && that.attrTypes[key] != 'moment' ) // NOTE: not sure I want to always exclude moment types
				data[key] = that.get(key)

	        // is this attribute a Model?
	        else if( attr instanceof Backbone.Model && attr.displayVal )
	            data[key] = attr.displayVal();

	        // is it a collection?
	        else if( attr instanceof Backbone.Collection )
	            data[key] = attr.toTemplateData();

	    })

	    // support for ChildCollection models
	    if( this.models )
	    _.each(this.models, function(d, key){
	        if( d.template )
	            data[key] = that.get(key) ? that.get(key).toTemplateData() : null
	    })

	    if( this._templateData )
	    _.each(this._templateData, function(val, key){
	        if( val === '' ) val = _.camelize(key);
	        data[key] = _.isFunction(val) ? val.call(that, val) : (that[val] && _.isFunction(that[val]) ? that[val].call(that) : that.get(val));

	        if( data[key] instanceof Backbone.Model )
	            data[key] = data[key].templateData()
	    })

	    return data;
	}

	Backbone.Collection.prototype.templateData = function(){ return this.toTemplateData() } // ! DEPRECATED
	Backbone.Collection.prototype.toTemplateData = function(){return this.map(function(m){return m.templateData()})}

	Backbone.Collection.prototype.toSelectID = function(labelKey, valKey, extraData){
	    var isString = _.isString(labelKey);
	    return this.map(function(m){
	        var d = {
	            'label':labelKey?(isString?(m[labelKey]&&m[labelKey].call(m))||m.get(labelKey):labelKey(m)):m.id,
	            'val':(valKey?m.get(valKey):m.id)
	        }
	        if( extraData ) _.each(extraData, function(val, key){
	            if( val === '' ) val = key;
	            d[key] = _.isFunction(val) ? val(m) : ((m[val]&&m[val].call(m))||m.get(val))
	        })
	        return d
	    })
	}

})()
