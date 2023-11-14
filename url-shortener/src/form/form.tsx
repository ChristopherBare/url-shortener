import '../App.css';

const Form = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                <form className="card-body">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Long URL</span>
                        </label>
                        <input type="email" placeholder="https://www..." className="input input-bordered" required />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Custom link</span>
                        </label>
                        <input type="password" placeholder="https://shorter.link..." className="input input-bordered" required />
                        {/*<label className="label">*/}
                        {/*    <a href="#" className="label-text-alt link link-hover">*/}
                        {/*        Forgot password?*/}
                        {/*    </a>*/}
                        {/*</label>*/}
                    </div>
                    <div className="form-control mt-6">
                        <button className="btn btn-primary">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Form;
