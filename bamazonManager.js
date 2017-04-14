//requiring mysql database for use
var mysql = require("mysql");
//requring the node package inquirer for user prompt
var inquirer = require("inquirer");
//connecting to our database 
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "AaNichol91!",
	database: "bamazon"
});
//checking if there is an error connecting to the database
connection.connect(function(error){
	if(error){
		console.log(error);
	}
});

//function that uses the inquirer package to gather data
function userInput(){
	inquirer.prompt([
	{
		name: "options",
		type: "list",
		message: "What would you like to do?",
		choices: ["View Products for Sale", "View Low Inventory", "Add To Inventory", "Add New Product"]
	}
	]).then(function(response){

		switch (response.options){
			case "View Products for Sale":
				viewProducts();
				break;

			case "View Low Inventory":
				lowInventory();
				break;

			case "Add To Inventory":
				addInventory();
				break;

			case "Add New Product":
				newProduct();
				break;
		};
	});
};

function viewProducts(){
	//search query that is selecting everything in our products table
	connection.query("SELECT * FROM products", function(error, results){
		if(error){
			console.log(error);
		}else{
			//looping through our table and grabbing our id, product, price, and quantity for each product
			for(var i = 0; i < results.length; i++){
				console.log("ID: " + results[i].item_id);
				console.log("Product: " + results[i].product_name);
				console.log("Price: " + "$" + results[i].price);
				console.log("Quantity: " + results[i].stock_quantity);
			};
		};
	});
};

function lowInventory(){
	connection.query("SELECT * FROM products", function(error, results){
		if(error){
			console.log(error);
		};

		for(var i = 0; i < results.length; i++){

			if(results[i].stock_quantity < 5){
				console.log("ID: " + results[i].item_id);
				console.log("Product: " + results[i].product_name + ", has low inventory (see quantity below)");
				console.log("Quantity: " + results[i].stock_quantity);
			}else{
				console.log("Product: " + results[i].product_name + ", has more than 5 in stock");
			};
		};

		inquirer.prompt([
			{
				name: "update",
				type: "list",
				message: "Would you like to re-stock the shelves?",
				choices: ["yes", "no"]
			}
			]).then(function(response){
				if(response.update == "yes"){
					addInventory();
				}else{
					console.log("Let's update inventory later.")
				};
			});
	});
};

function updateInventory(id, amount){
	connection.query("UPDATE products SET ? WHERE item_id =" + id, {stock_quantity: amount}, function(error, response){
		if(error){
			console.log(error);
		}else{
			console.log("Inventory Updated");
		};
	});
};

function addInventory(){
	//array we will use for choices in our inquirer prompt
	var choicesArray = [];
	connection.query("SELECT * FROM products", function(error, results){
		if(error){
			console.log(error);
		}
		for (var i = 0; i < results.length; i++){
			choicesArray.push("ID:" + results[i].item_id + ", " + " Product:" + results[i].product_name + ", " + " Quantity: " + results[i].stock_quantity);
		}
		inquirer.prompt([
			{
				name: "restock",
				type: "list",
				message: "Which product would you like to add inventory to?",
				choices: choicesArray
			},
			{
				name: "number",
				type: "input",
				message: "How much inventory would you like to add?"
			}
			]).then(function(response){
				console.log(response.restock);
				var managerChoice = response.restock.split(",");
				var itemID = managerChoice[0];
				var name = managerChoice[1];
				var splitID = itemID.split(":");
				var splitName = name.split(":");
				var newID = splitID[1];
				var productName = splitName[1];
				var updateAmount = parseInt(response.number);
				console.log(updateAmount);
				console.log(newID);
				console.log(productName);

				for(var i = 0; i < results.length; i++){
					if(newID == results[i].item_id && productName == results[i].product_name){
						var newAmount = updateAmount + results[i].stock_quantity;
						updateInventory(newID, newAmount);
					};
				};
			});
	});		
};

function newProduct(){
	inquirer.prompt([
		{
			name: "id",
			type: "input",
			message: "Create an ID for the product (ID has to be above #10)"
		},
		{
			name: "product",
			type: "input",
			message: "What is the name of the item you would like to add?"	
		},
		{
			name: "department",
			type: "input",
			message: "What department does the product belong to?"
		},
		{
			name: "price",
			type: "input",
			message: "How much would you like to sell the product for?"
		},
		{
			name: "amount",
			type: "input",
			message: "How much of the product would you like to sell?"
		}
		]).then(function(response){
			var addID = parseInt(response.id);
			var addProduct = response.product;
			var addDepartment = response.department;
			var addPrice = parseInt(response.price).toFixed(2);
			var addAmount = parseInt(response.amount);
			var query = "INSERT INTO products SET ?";
			connection.query(query, {item_id: addID, product_name: addProduct, department_name: addDepartment, price: addPrice, stock_quantity: addAmount}, function(error, results){
				if(error){
					console.log(error);
				}else{
					console.log("You have successfully added a new product to the inventory.");
				};
			});

		});
};

//intially calling our showStock function to display everything in our database
userInput();


