namespace AuctionHouse.Api.Services
{
    /// <summary>
    /// Generic result wrapper for service operations
    /// </summary>
    public class ServiceResult
    {
        public bool IsSuccess { get; set; }
        public string Error { get; set; } = string.Empty;

        public static ServiceResult Success()
        {
            return new ServiceResult { IsSuccess = true };
        }

        public static ServiceResult Failure(string error)
        {
            return new ServiceResult { IsSuccess = false, Error = error };
        }
    }

    /// <summary>
    /// Generic result wrapper for service operations with data
    /// </summary>
    public class ServiceResult<T>
    {
        public bool IsSuccess { get; set; }
        public string Error { get; set; } = string.Empty;
        public T? Data { get; set; }

        public static ServiceResult<T> Success(T data)
        {
            return new ServiceResult<T> { IsSuccess = true, Data = data };
        }

        public static ServiceResult<T> Failure(string error)
        {
            return new ServiceResult<T> { IsSuccess = false, Error = error };
        }
    }
}
