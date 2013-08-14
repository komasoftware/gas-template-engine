gas-template-engine
===================

A Google ApssScript that will fill out a template file on Google Drive from a JSON input string. 
It will iterate over any array it finds in the JSON structure and create table rows per array value.

For example, give JSON structure :

<code>
 {"invoice":
	{"invoiceNumber":"00001",
	 "invoiceStatus":"OPEN",
	 "invoiceDate":"22-jun-2013",
	 "totalPriceExVat":"6.778,11 €",
  	 "totalPriceIncVat":"64.264,41 €",
	 "totalVat":"57.486,30 €",
	 "dueDate":"22-jul-2013",
	 "extraLines":"",
	 "paymentStatus":"UNPAID"
	},
   "invoiceItems":
		[
                   {
			"quantity":"6,63",
			"vatPercentage":"803%",
			"unitPrice":"831,74 €",
			"itemName":"item 1",
			"itemDescription":"nails",
			"priceExVat":"5.514,44 €",
			"vat":"44.280,95 €",
			"priceIncVat":"49.795,39 €"
		   },
		   {
			"quantity":"7,68",
			"vatPercentage":"1.045%",
			"unitPrice":"164,54 €",
			"itemName":"4a9133cf-c8a5-44d6-a849-a72a17ffc49d",
			"itemDescription":"d4431a69-35e5-4f86-8ec0-f9ebb2da33bf",
			"priceExVat":"1.263,67 €",
			"vat":"13.205,35 €",
			"priceIncVat":"14.469,02 €"
		   }      
		],
   "client":
		{
			"namePrefix":"",
			"name":"jan",
			"contactName":"jan smith",
			"companyName":"saas company",
			"email":"saas@example.com",
		},
    "profile":{
		"companyName":"apps script producer limited","email":"limited@example.com","phoneNumber":""
	}
};
</code>

Now create a Google Docs file and put place holders anywhere you like :

$client.namePrefix
$invoice.invoiceNumber


Create a table and put $invoiceItems.quantity in one of the rows and the row will be repeated for the each array element.

I will provide an example any time soon.
