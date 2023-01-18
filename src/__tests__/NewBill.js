/* eslint-disable jest/no-mocks-import */
/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor, within} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {bills} from "../fixtures/bills.js";
import "@testing-library/jest-dom";
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockedStore);

const setNewBill = () => {
    return new NewBill({
        document,
        onNavigate,
        store: mockedStore,
        localStorage: window.localStorage,
    });
};

beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
    });

    window.localStorage.setItem(
        "user",
        JSON.stringify({
            type: "Employee",
            email: "a@a",
        })
    );
});

beforeEach(() => {
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    document.body.innerHTML = NewBillUI();
    window.onNavigate(ROUTES_PATH.NewBill);
});

afterEach(() => {
    jest.resetAllMocks();
    document.body.innerHTML = "";
});


describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then newBill icon in vertical layout should be highlighted", () => {
            const windowIcon = screen.getByTestId("icon-mail");
            expect(windowIcon).toHaveClass("active-icon");
        });

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
        })
    })
    describe("When I do not fill fields and I click on submit button", () => {
        test("Then the function handleSubmit and calls", () => {
            const newBill = setNewBill();

            const newBillForm = screen.getByTestId("form-new-bill");

            const handleSubmit = jest.spyOn(newBill, "handleSubmit");

            newBillForm.addEventListener("submit", handleSubmit);
            fireEvent.submit(newBillForm);

            expect(handleSubmit).toHaveBeenCalledTimes(1);

            // expect(newBillForm).toBeVisible();
        });
    });


    describe("When i click the send button", () => {
            test("Then the form should be send", () => {
                // Configurer une fonction pour mettre à jour le chemin d'accès
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({pathname});
                };
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


            it("Then the picture format is not defined", () => {
                const filePicture = screen.getByTestId("file")
                const handleChangeFile = jest.fn(setNewBill().handleChangeFile)
                filePicture.addEventListener("change", handleChangeFile)
                fireEvent.change(filePicture, {target: {files: [{name: 'test.pdf', type: 'image/jpeg'}]}})
                expect(filePicture.files[0].name).not.toBe('test.jpg')
                const expectErreur = screen.getByText("Erreur Type File")
                expect(expectErreur).toBeInTheDocument()
            })
            it("Then the picture format is defined", () => {
                const filePicture = screen.getByTestId("file")
                const handleChangeFile = jest.fn(setNewBill().handleChangeFile)
                filePicture.addEventListener("change", handleChangeFile)
                fireEvent.change(filePicture, {target: {files: [{name: 'test.jpg', type: 'image/jpeg'}]}})
                expect(filePicture.files[0].name).toBe('test.jpg')
            })
        }
    )
    describe("When I navigate to newBill Page", () => {
        test("Then fetches newBill from mock API POST", async () => {
            const createBill = jest.fn(mockedStore.bills().create);
            const updateBill = jest.fn(mockedStore.bills().update);
            const {fileUrl, key} = await createBill();
            expect(createBill).toHaveBeenCalledTimes(1);
            expect(key).toBe("1234");
            expect(fileUrl).toBe("https://localhost:3456/images/test.jpg");
            const newBill = updateBill();
            expect(updateBill).toHaveBeenCalledTimes(1);

            await expect(newBill).resolves.toEqual({
                id: "47qAXb6fIm2zOKkLzMro",
                vat: "80",
                fileUrl:
                    "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                status: "pending",
                type: "Hôtel et logement",
                commentary: "séminaire billed",
                name: "encore",
                fileName: "preview-facture-free-201801-pdf-1.jpg",
                date: "2004-04-04",
                amount: 400,
                commentAdmin: "ok",
                email: "a@a",
                pct: 20,
            });
        });
        describe("When an error occurs on API", () => {
            test("Then new bill is added to the API but fetch fails with '404 page not found' error", async () => {
                const newBill = setNewBill();

                const mockedBill = jest
                    .spyOn(mockedStore, "bills")
                    .mockImplementationOnce(() => {
                        return {
                            create: jest.fn().mockRejectedValue(new Error("Erreur 404")),
                        };
                    });

                await expect(mockedBill().create).rejects.toThrow("Erreur 404");

                expect(mockedBill).toHaveBeenCalledTimes(1);

                expect(newBill.billId).toBeNull();
                expect(newBill.fileUrl).toBeNull();
                expect(newBill.fileName).toBeNull();
            });
            test("Then new bill is added to the API but fetch fails with '500 Internal Server error'", async () => {
                const newBill = setNewBill();
                const mockedBill = jest
                    .spyOn(mockedStore, "bills")
                    .mockImplementationOnce(() => {
                        return {
                            create: jest.fn().mockRejectedValue(new Error("Erreur 500")),
                        };
                    });

                await expect(mockedBill().create).rejects.toThrow("Erreur 500");

                expect(mockedBill).toHaveBeenCalledTimes(1);

                expect(newBill.billId).toBeNull();
                expect(newBill.fileUrl).toBeNull();
                expect(newBill.fileName).toBeNull();
            });
        })
    })
})
