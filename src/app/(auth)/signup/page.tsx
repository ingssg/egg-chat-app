"use client";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createUser } from "@/services/auth";
import { IoMdArrowRoundBack } from "react-icons/io";
import Swal from "sweetalert2";

interface FormValues {
  id: string;
  userName: string;
  gender: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object().shape({
  id: Yup.string()
    .min(4, "아이디는 최소 4자여야 합니다")
    .max(10, "아이디는 10자를 넘을 수 없습니다.")
    .required("아이디는 필수 항목입니다")
    .matches(
      /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]*$/u,
      "아이디에 이모지를 사용할 수 없습니다.",
    ),
  userName: Yup.string()
    .min(2, "닉네임은 최소 2자여야 합니다")
    .max(10, "닉네임은 10자를 넘을 수 없습니다.")
    .required("닉네임은 필수 항목입니다")
    .notOneOf(
      ["MALE", "FEMALE", "male", "female"],
      "사용할 수 없는 닉네임입니다.",
    )
    .matches(
      /^[^\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]*$/u,
      "닉네임에 이모지를 사용할 수 없습니다.",
    ),
  password: Yup.string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,10}$/,
      "4~10자의 영문, 숫자를 조합해서 입력하세요",
    )
    .min(4, "비밀번호는 최소 4자 이상이어야 합니다.")
    .max(10, "비밀번호는 10자를 넘을 수 없습니다.")
    .required("비밀번호는 필수 항목입니다."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "비밀번호가 일치하지 않습니다")
    .required("비밀번호 확인은 필수 항목입니다."),
});

const Signup = () => {
  const router = useRouter();

  const initialValues: FormValues = {
    id: "",
    userName: "",
    gender: "MALE",
    password: "",
    confirmPassword: "",
  };

  const errorStyle = "text-red-500 text-sm font-medium mt-1 ml-2";

  const handleSignUp = async (values: FormValues) => {
    const request = {
      id: values.id,
      nickname: values.userName,
      password: values.password,
      gender: values.gender,
    };
    try {
      const response = (await createUser(request)) as Response;
      if (response.status == 201) {
        router.push("/login");
      } else if ((response as any).response.data.statusCode === 500) {
        Swal.fire({
          icon: "warning",
          title: "이미 사용 중인 아이디입니다",
        });
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  return (
    <div className="flex items-center justify-center px-6 py-8 mx-auto h-full max-w-[1200px]">
      <div className="relative w-1/2 p-5 px-[80px] bg-amber-50 rounded-2xl custom-shadow min-w-[500px]">
        <button
          className="text-4xl absolute left-8"
          onClick={() => router.push("/login")}
        >
          <IoMdArrowRoundBack />
        </button>
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <p className="text-4xl text-center font-bold">회원 가입</p>
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            handleSignUp(values);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4 md:space-y-6">
              <div>
                <label>아이디</label>
                <Field
                  name="id"
                  className="border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                />
                <ErrorMessage
                  className={`error ${errorStyle}`}
                  component="p"
                  name="id"
                />
              </div>
              <div>
                <label>닉네임</label>
                <Field
                  name="userName"
                  className="border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                />
                <ErrorMessage
                  className={`error ${errorStyle}`}
                  component="p"
                  name="userName"
                />
              </div>
              <div>
                <label>성별</label>
                <Field
                  name="gender"
                  as="select"
                  className="border ml-5 p-2 rounded-lg border-gray-300"
                >
                  <option value="MALE">남성</option>;
                  <option value="FEMALE">여성</option>
                </Field>
              </div>
              <div>
                <label>비밀번호</label>
                <Field
                  name="password"
                  type="password"
                  className="border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                />
                <ErrorMessage
                  className={`error ${errorStyle}`}
                  component="p"
                  name="password"
                />
              </div>
              <div>
                <label>비밀번호 확인</label>
                <Field
                  name="confirmPassword"
                  type="password"
                  className="border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                />
                <ErrorMessage
                  className={`error ${errorStyle}`}
                  component="p"
                  name="confirmPassword"
                />
              </div>

              <div className="w-full flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-64  bg-amber-400 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-lg px-5 py-2.5 text-center custom-shadow"
                >
                  회원 가입
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Signup;
