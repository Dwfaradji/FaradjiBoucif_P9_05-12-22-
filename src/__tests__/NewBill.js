/**
 * @jest-environment jsdom
 */

import {screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

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
            const html = NewBillUI()
            document.body.innerHTML = html
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
            const newBills = new NewBill({
                document,
                onNavigate,
                store: mockedStore,
                localStorage: window.localStorage,
            });

            document.body.innerHTML = NewBillUI()
            const formNewBill = screen.getByTestId("form-new-bill")
            const handleSubmit = jest.fn(newBills.handleSubmit);
            formNewBill.addEventListener("submit", handleSubmit);
            userEvent.click(formNewBill);
            expect(handleSubmit).toHaveBeenCalled();
        })
    })
})
