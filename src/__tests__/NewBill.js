/**
 * @jest-environment jsdom
 */

import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {bills} from "../fixtures/bills.js";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";
// import {jest} from "@jest/globals";


jest.mock("../app/Store", () => mockedStore);

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then ,it should load the form", () => {
            document.body.innerHTML = NewBillUI()
            expect(screen.getByTestId('form-new-bill')).toBeTruthy()
            expect(screen.getByTestId('expense-type')).toBeTruthy()
            expect(screen.getByTestId('expense-name')).toBeTruthy()
            expect(screen.getByTestId('datepicker')).toBeTruthy()
            expect(screen.getByTestId('amount')).toBeTruthy()
            expect(screen.getByTestId('vat')).toBeTruthy()
            expect(screen.getByTestId('pct')).toBeTruthy()
            expect(screen.getByTestId('commentary')).toBeTruthy()
            expect(screen.getByTestId('file')).toBeTruthy()
            //to-do write assertion

        })

    })


    describe("When i click the send button", () => {
        test("Then the form should submit to the backend", () => {
            // Vérifie si la variable 'bills' est définie
            if (!bills) {
                throw new Error("The 'bills' variable is not defined.");
            }
            // Configurer une fonction pour mettre à jour le chemin d'accès
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname});
            };
            //  mock de l'objet window.localStorage
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            // Définit l'utilisateur dans le stockage local
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            // Rendu du composant NewBillUI
            document.body.innerHTML = NewBillUI()

            // Récupère le bouton 'Envoyer'
            const buttonNewBill = screen.getByRole("button", {
                name: /Envoyer/i,
            });
            expect(buttonNewBill).toBeTruthy();

            // Configurer le composant NewBill
            const newBills = new NewBill({
                document,
                onNavigate,
                store: mockedStore,
                localStorage: window.localStorage,
            });
            // Configurer les données du formulaire
            const inputBillForm = {
                email: bills[0].email,
                type: bills[0].type,
                name: bills[0].name,
                amount: bills[0].amount.toString(),
                date: bills[0].date,
                vat: bills[0].vat.toString(),
                pct: parseInt(bills[0].pct, 10) || 20,
                commentary: bills[0].commentary,
                fileUrl: bills[0].fileUrl,
                status: bills[0].status
            }

            // Récupère les éléments d'entrée du formulaire
            const inputType = screen.getByTestId("expense-type");
            const inputName = screen.getByTestId("expense-name");
            const inputAmount = screen.getByTestId("amount");
            const inputDate = screen.getByTestId("datepicker");
            const inputVat = screen.getByTestId("vat");
            const inputPct = screen.getByTestId("pct");
            const inputCommentary = screen.getByTestId("commentary");

            // Remplir le formulaire avec les données d'entrée
            fireEvent.change(inputType, {target: {value: inputBillForm.type}})
            fireEvent.change(inputName, {target: {value: inputBillForm.name}})
            fireEvent.change(inputAmount, {target: {value: inputBillForm.amount}})
            fireEvent.change(inputDate, {target: {value: inputBillForm.date}})
            fireEvent.change(inputVat, {target: {value: inputBillForm.vat}})
            fireEvent.change(inputPct, {target: {value: inputBillForm.pct}})
            fireEvent.change(inputCommentary, {target: {value: inputBillForm.commentary}})

            expect(inputType.value).toBe(inputBillForm.type);
            expect(inputName.value).toBe(inputBillForm.name);
            expect(inputAmount.value).toBe(inputBillForm.amount);
            expect(inputDate.value).toBe(inputBillForm.date);
            expect(inputVat.value).toBe(inputBillForm.vat);
            expect(inputPct.value).toBe(inputBillForm.pct.toString());
            expect(inputCommentary.value).toBe(inputBillForm.commentary);

            const formNewBill = screen.getByTestId("form-new-bill")

            // Définir un écouteur d'événement 'submit' avec la fonction 'handleSubmit'
            Object.defineProperty(formNewBill, "submit", {
                value: newBills.handleSubmit,
            });

            // Soumettre le formulaire
            fireEvent.submit(formNewBill);
            const expectedText = screen.getByText("Mes notes de frais")
            expect(expectedText).toBeInTheDocument()
        })
        // test("Then the form should submit to the backend", () => {
        //     // Configurer le composant NewBill
        //     const newBills = configureNewBill();
        //
        //     // Rendu du composant NewBillUI
        //     document.body.innerHTML = NewBillUI()
        //
        //
        //     // Récupère le bouton 'Envoyer'
        //     const buttonNewBill = screen.getByRole("button", {
        //         name: /Envoyer/i,
        //     });
        //     expect(buttonNewBill).toBeTruthy();
        //
        //     // Récupère les éléments d'entrée du formulaire
        //     const inputType = screen.getByTestId("expense-type");
        //     const inputName = screen.getByTestId("expense-name");
        //     const inputAmount = screen.getByTestId("amount");
        //     const inputDate = screen.getByTestId("datepicker");
        //     const inputVat = screen.getByTestId("vat");
        //     const inputPct = screen.getByTestId("pct");
        //     const inputCommentary = screen.getByTestId("commentary");
        //
        //     // Remplir le formulaire avec les données d'entrée
        //     fillForm(inputBillForm, inputType, inputName, inputAmount, inputDate, inputVat, inputPct, inputCommentary);
        //
        //     // Récupère le formulaire de nouvelle facture
        //     const formNewBill = screen.getByTestId("form-new-bill");
        //
        //     // Définir un écouteur d'événement 'submit' avec la fonction 'handleSubmit'
        //     Object.defineProperty(formNewBill, "submit", {
        //         value: newBills.handleSubmit,
        //     });
        //
        //     // Soumettre le formulaire
        //     fireEvent.submit(formNewBill);
        //
        //     // Vérifier que le texte "Mes notes de frais" est affiché
        //     const expectedText = screen.getByText("Mes notes de frais");
        //     expect(expectedText).toBeInTheDocument();
        // });

// Fonction pour configurer le composant NewBill
//         const configureNewBill = () => {
//             // Configurer une fonction pour mettre à jour le chemin d'accès
//             const onNavigate = (pathname) => {
//                 document.body.innerHTML = ROUTES({pathname});
//             };

            // Utiliser un try-catch pour gérer les erreurs de l'objet

            test("Then the picture format is not defined", () => {
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({pathname});
                };

                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                window.localStorage.setItem(
                    "user",
                    JSON.stringify({
                        type: "Employee",
                    })
                );
                document.body.innerHTML = NewBillUI()
                const newBills = new NewBill({
                    document,
                    onNavigate,
                    store: mockedStore,
                    localStorage: window.localStorage,
                });
                const filePicture = screen.getByTestId("file")
                const handleChangeFile = jest.fn(newBills.handleChangeFile)
                filePicture.addEventListener("change", handleChangeFile)
                fireEvent.change(filePicture, {target: {files: [{name: 'test.jpg', type: 'image/jpeg'}]}})
                expect(filePicture.files[0].name).toBe('test.jpg')
                fireEvent.change(filePicture, {target: {files: [{name: 'test.pdf', type: 'image/jpeg'}]}})
                expect(filePicture.files[0].name).not.toBe('test.jpg')
                const x = screen.getByText("Erreur Type File")
                expect(x).toBeInTheDocument()
            })
        }
    )
    })
