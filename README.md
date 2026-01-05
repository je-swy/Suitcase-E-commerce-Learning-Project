# Best Shop - Suitcase E-commerce Project

This is a fully responsive, multi-page e-commerce website for a suitcase store, built as part of a learning project. The application is created using HTML, SCSS, and vanilla JavaScript, with a strong focus on clean code, reusability, and modern development practices.

## ✨ Features

- **Homepage:** Featuring a dynamic hero section, a product carousel with hover effects, and sections for "Selected Products" and "New Arrivals".
- **Catalog Page:** A fully functional product catalog with:
  - Multi-criteria filtering (category, color, size, on-sale status).
  - Dynamic sorting (by price, popularity, rating).
  - Live search functionality.
  - Client-side pagination.
- **Product Details Page:** Dynamically generated pages for each product, including an image gallery, quantity selector, product description, and a "You May Also Like" section.
- **Shopping Cart:** A fully interactive shopping cart that allows users to update item quantities, remove items, clear the cart, and proceed to checkout. It also includes dynamic calculation of totals and discounts.
- **Static Pages:** Clean and responsive "About Us" and "Contact Us" pages.
- **Interactive Forms:** All forms (Login, Reviews, Contact) include client-side validation and provide user feedback without reloading the page.
- **Component-Based Architecture:** The project utilizes a component-based approach, loading shared elements like the header and footer dynamically with JavaScript.
- **Responsive Design:** The layout is fully responsive and optimized for a seamless experience on desktop, tablet, and mobile devices.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v16 or later is recommended)
- npm (which comes bundled with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://autocode.git.epam.com/katylin482/project-template-ua.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd project-template
    ```
3.  **Install dependencies:**
    This command will install all the necessary development dependencies listed in the `package.json` file, such as Sass, ESLint, and Stylelint.
    ```bash
    npm install
    ```

## 🔧 Usage

### Sass Compilation

The project uses Sass for styling. To compile the `.scss` files into a single `main.css` file, run the following command. The compiler will also watch for any changes you make to the SCSS files and automatically recompile them.

```bash
npm run scss
```

This command compiles src/scss/main.scss into src/js/main.css

### Running the Project

To view the project, it is highly recommended to use a local server extension that serves files from the root of the project directory. The **Live Server** extension for Visual Studio Code is a great option.

1.  Open the project folder in VS Code.
2.  Right-click on the `src/index.html` file and select "Open with Live Server".

Code Linting
The project is set up with ESLint for JavaScript and Stylelint for SCSS to ensure code quality and consistency. To check your files for any linting errors, run:

```bash
npm run lint
```

You can also run checks for JavaScript and SCSS separately:

```bash
npm run lint:js
npm run lint:scss
```

## Enjoy the project!
