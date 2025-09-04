import { makeAuthenticatedUser, makeUser } from "./make-user.ts";
import { makeCourse } from "./make-course.ts";

export async function makeCreateEnrollment() {
    const user = await makeUser()
    const course = await makeCourse()
    const { token } = await makeAuthenticatedUser('student')

    return {
        token,
        user,
        course
    }
}
