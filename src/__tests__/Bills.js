/**
 * @jest-environment jsdom
 */
import {screen, waitFor} from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store.js"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";


jest.mock("../app/store", () => mockedStore);


describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            await waitFor(() => windowIcon)
            //to-do write expect expression
            expect(windowIcon).toHaveClass("active-icon")
        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({data: bills})
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            // const antiChrono = (a, b) => (a < b ? 1 : -1)
            const antiChrono = (a, b) => new Date(a.date) - new Date(b.date);
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
    })
    describe("When I click on one eye icon", () => {
        test("Then a modal should open", async () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname})
            }
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            })
            window.localStorage.setItem("user", JSON.stringify({
                type: "Employee"
            }))
            const billsPage = new Bills({
                document,
                onNavigate,
                store: mockedStore,
                localStorage: window.localStorage
            })

            document.body.innerHTML = BillsUI({data: bills})
            const iconEyes = screen.getAllByTestId(("icon-eye"))
            const handleClickIconEye = jest.fn(billsPage.handleClickIconEye)
            const modale = document.getElementById("modaleFile")
            $.fn.modal = jest.fn(() => modale.classList.add("show"))
            iconEyes.forEach((iconEye) => {
                iconEye.addEventListener('click', () => handleClickIconEye(iconEye))
                userEvent.click(iconEye)
                expect(handleClickIconEye).toHaveBeenCalled()
                expect(modale).toHaveClass("show")
            })
        })
    })
    describe("When I click in the button NewBill", () => {
        test("Then I should be sent on New Bill form", () => {
            const onNavigate = (pathname) => {
                document.body.innertHTML = ROUTES({pathname})
            }
            Object.defineProperty(window, 'localStorage', {
                value: localStorageMock
            })
            window.localStorage.setItem("user", JSON.stringify({
                type: "Employee"
            }))
            const billPage = new Bills({document, onNavigate, store: mockedStore, localStorage: window.localStorage})
            document.body.innerHTML = BillsUI({data: bills})
            const newBillBtn = screen.getByTestId(("btn-new-bill"))
            const handleClickNewBill = jest.fn(billPage.handleClickNewBill)
            newBillBtn.addEventListener("click", handleClickNewBill)
            userEvent.click(newBillBtn)
            expect(handleClickNewBill).toHaveBeenCalled()
        })
    })

    describe("When I went on Bills page and it is loading", () => {
        test("Then, Loading page should be rendered", () => {
            document.body.innerHTML = BillsUI({loading: true});
            expect(screen.getByText("Loading...")).toBeVisible();
            document.body.innerHTML = "";
        });
    });
})

