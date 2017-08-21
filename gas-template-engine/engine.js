function doGet() {
  Logger.log("incoming :" + e);
  var context = {"invoice":{"invoiceNumber":"FACT00001","invoiceStatus":"OPEN","invoiceDate":"22-jun-2013","totalPriceExVat":"6.778,11 €","totalPriceIncVat":"64.264,41 €","totalVat":"57.486,30 €","dueDate":"22-jul-2013","extraLines":"","paymentStatus":"UNPAID"},
                 "invoiceItems":[
                   {"quantity":"6,63","vatPercentage":"803%","unitPrice":"831,74 €","itemName":"eaa68132-de03-42ab-b4b6-4872cd226b43","itemDescription":"2598e9a3-2dcf-4ec8-bf54-6e81d4e73d27","priceExVat":"5.514,44 €","vat":"44.280,95 €","priceIncVat":"49.795,39 €"},
                   {"quantity":"7,68","vatPercentage":"1.045%","unitPrice":"164,54 €","itemName":"4a9133cf-c8a5-44d6-a849-a72a17ffc49d","itemDescription":"d4431a69-35e5-4f86-8ec0-f9ebb2da33bf","priceExVat":"1.263,67 €","vat":"13.205,35 €","priceIncVat":"14.469,02 €"}
                 ],
                "client":{"namePrefix":"","name":"20c12cc6-afb8-4df4-822a-5a327ba4478c 8dda2027-1464-4c71-b73c-6264e8f48f6c","contactName":"20c12cc6-afb8-4df4-822a-5a327ba4478c 8dda2027-1464-4c71-b73c-6264e8f48f6c","companyName":null,"email":"xubz7l@ow9erlpfg.kz","phoneNumber":"284f2734-5451-49f1-8dd2-7e00043cb23f","vatNumber":"","street":"eec6569a-9d97-4fbc-8666-e25070ed32f7","city":"4c34e7ba-30f9-4ed1-942f-ee3920589d41","country":"Belgium","countryCode":"BE","formattedAddress":"eec6569a-9d97-4fbc-8666-e25070ed32f7\n4c34e7ba-30f9-4ed1-942f-ee3920589d41\nBelgium"},
                "profile":{"companyName":"f47ba048-0410-4048-83fb-37b2bb1a7609","email":"","phoneNumber":"","street":"d48489a9-5e15-4a4b-a653-e35ce402aff8","city":"5d273f26-84d5-4552-9365-2e94293c2b04","country":"Belgium","countryCode":"BE","formattedAddress":"d48489a9-5e15-4a4b-a653-e35ce402aff8\n5d273f26-84d5-4552-9365-2e94293c2b04\nBelgium","information":"","website":"","vatNumber":"0465834877"}
               };
  var options = { "fileId" : "your-template-file-id" };
  var engine = template_engine(context, options);
  return ContentService.createTextOutput(engine.process());
}

function doPost(e) {
  Logger.log("incoming :" + e.postData.getDataAsString());
  var context = JSON.parse(e.postData.getDataAsString());
  var options = { "fileId" : "your-template-file-id" };
  Logger.log("creating engine");
  var engine = template_engine(context, options);
  Logger.log("incoming :" + e.postData.getDataAsString());
  
  var output = ContentService.createTextOutput(engine.process());
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
}


function template_engine(payload, options) {
 
  var startPayload = payload || {};
  
  var options = options || {};
  
  var doc = DocumentApp.openById(options.fileId);

  var that = {};
  
  function processValue(asProperty, asValue, context) {
    Logger.log("processing property " + asProperty + " as value " + asValue);
    var regexp = buildRegexp(asProperty);
    context.replaceText(regexp, "" + asValue);
    
  }

  
  /******************************************************************************
  /*
  /* Process array by finding template properties that belong to a table.
  /* Repeat the table row for each array element and then process each table row
  /* with the values from the array.
  /*
  /******************************************************************************/
  function processArray(asProperty, asArray, context) {
    Logger.log("processing property " + asProperty + " as array " + asArray);
    var searchResult = context.findText(buildRegexp(asProperty));
    if (searchResult) {
      var element = searchResult.getElement();
      var table;
      var tableRow;
      while (element) {
        Logger.log("inspecting element " + element + " of type " + element.getType());
        if (element.getType() === DocumentApp.ElementType.TABLE) {
          table = element;
          break;
        } else if (element.getType() === DocumentApp.ElementType.TABLE_ROW) {
          tableRow = element;
          element = element.getParent();
        } else {
          element = element.getParent();
        }
      }
      Logger.log("found table : " + table + " and tableRow : " + tableRow);
      if (table && tableRow) {
        var rows = [];
        rows[0] = tableRow;
        for (var extraRows = 1; extraRows < asArray.length; extraRows++) {
          var extraRow = tableRow.copy();
          rows[extraRows] = table.appendTableRow(extraRow);
        }
        for (var rowIndex = 0; rowIndex < asArray.length; rowIndex++) {
          processComplex(asProperty, asArray[rowIndex], rows[rowIndex]);
        }
      }
    }
  }
  
  /******************************************************************************
  /*
  /* Process any object as a template property :
  /* - a primitive : by replacing the $property by the value of the primitive
  /* - an array : by repeating the table row where the property is found for each array element
  /* - a complex object : by calling this function as the concatenated property of the incoming 
  /*   property and the object's property and the value as incoming object;
  /*
  /******************************************************************************/
  function processComplex(asProperty, asComplex, context) {
 
      if (typeof asComplex ==="undefined" || asComplex === null) {
        if (asProperty) {
          processValue(asProperty, "", context); 
        }
      }
      if (typeof asComplex === "number" || typeof asComplex === "string" || typeof asComplex === "boolean") {
        if (asProperty) {
          processValue(asProperty, asComplex, context); 
        }
      }
      if (typeof asComplex == "object") {
        if( Object.prototype.toString.call( asComplex ) === '[object Array]' ) {
          processArray(asProperty, asComplex, context);
        } else {
          var prop;
          for (prop in asComplex){
            var propValue = asComplex[prop];
            processComplex(buildPropertyPath(asProperty, prop), propValue, context);
          }
        }
      }
  }
  
  function buildRegexp(asProperty) {
    var regexp = "\\$" + asProperty;
    return regexp;
  }
  
  function buildPropertyPath(prefix, path) {
    var ret;
    if (prefix) {
      ret = prefix + "." + path;
    } else {
      ret = path;
    }
    return ret;
  }
  
  that.process = function() {
    processComplex(null, startPayload, doc.getBody());
    processComplex(null, startPayload, doc.getHeader());
    processComplex(null, startPayload, doc.getFooter());
    doc.saveAndClose();
    return doc.getUrl();
  }
  
  
  
  return that;
}
