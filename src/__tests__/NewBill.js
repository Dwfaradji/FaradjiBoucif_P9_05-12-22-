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


jest.mock("../app/store", () => mockedStore);

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
            const buttonNewBill = screen.getByRole("button", {
                name: /Envoyer/i,
            });
            expect(buttonNewBill).toBeTruthy();
            const newBills = new NewBill({
                document,
                onNavigate,
                store: mockedStore,
                localStorage: window.localStorage,
            });

            // // screen.debug()
            document.body.innerHTML = NewBillUI()
            const inputBillForm = {
                email:bills[0].email,
                type: bills[0].type,
                name: bills[0].name,
                amount: bills[0].amount.toString(),
                date: bills[0].date,
                vat: bills[0].vat.toString(),
                pct: bills[0].pct.toString(),
                commentary: bills[0].commentary,
                fileUrl: bills[0].fileUrl,
                status: bills[0].status
            }

            const inputType = screen.getByTestId("expense-type");
            const inputName = screen.getByTestId("expense-name");
            const inputAmount = screen.getByTestId("amount");
            const inputDate = screen.getByTestId("datepicker");
            const inputVat = screen.getByTestId("vat");
            const inputPct = screen.getByTestId("pct");
            const inputCommentary = screen.getByTestId("commentary");
            const inputFileUrl = screen.getByTestId("file");


            fireEvent.change(inputType, {target: {value: inputBillForm.type}})
            fireEvent.change(inputName, {target: {value: inputBillForm.name}})
            fireEvent.change(inputAmount, {target: {value: inputBillForm.amount}})
            fireEvent.change(inputDate, {target: {value: inputBillForm.date}})
            fireEvent.change(inputVat, {target: {value: inputBillForm.vat}})
            fireEvent.change(inputPct, {target: {value: inputBillForm.pct}})
            fireEvent.change(inputCommentary, {target: {value: inputBillForm.commentary}})
            // fireEvent.change(inputFileUrl, {target: {value: inputBillForm.fileUrl}})
            console.log(inputBillForm.amount)
            expect(inputType.value).toBe(inputBillForm.type);
            expect(inputName.value).toBe(inputBillForm.name);
            expect(inputAmount.value).toBe(inputBillForm.amount);
            expect(inputDate.value).toBe(inputBillForm.date);
            expect(inputVat.value).toBe(inputBillForm.vat);
            expect(inputPct.value).toBe(inputBillForm.pct);
            expect(inputCommentary.value).toBe(inputBillForm.commentary);
            expect(inputBillForm.fileUrl).toBe(inputBillForm.fileUrl);


            const formNewBill = screen.getByTestId("form-new-bill")
            const handleSubmit = jest.fn(newBills.handleSubmit);
            formNewBill.addEventListener("submit", handleSubmit);

            fireEvent.submit(formNewBill);
            expect(handleSubmit).toHaveBeenCalled();

        })
    })
})
